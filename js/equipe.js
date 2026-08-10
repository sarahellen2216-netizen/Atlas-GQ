```javascript
/* =========================================================
   ATLAS GESTÃO — EQUIPE
   Cadastro, edição, exclusão, pesquisa e filtros
   ========================================================= */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURAÇÕES
       ===================================================== */

    const STORAGE_KEY = "atlas_equipe";

    const ITEMS_PER_PAGE = 10;

    let employees = [];

    let filteredEmployees = [];

    let currentPage = 1;

    let employeeToDelete = null;

    let toastTimer = null;


    /* =====================================================
       ELEMENTOS
       ===================================================== */

    const employeeModal =
        document.getElementById("employeeModal");

    const deleteEmployeeModal =
        document.getElementById("deleteEmployeeModal");

    const employeeForm =
        document.getElementById("employeeForm");

    const employeeTableBody =
        document.getElementById("employeesTableBody");

    const employeeSearch =
        document.getElementById("employeesSearch");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const statusFilter =
        document.getElementById("employeeStatusFilter");


    /* =====================================================
       BANCO LOCAL
       ===================================================== */

    function loadEmployees() {

        try {

            const saved =
                localStorage.getItem(STORAGE_KEY);

            employees = saved
                ? JSON.parse(saved)
                : [];

            if (!Array.isArray(employees)) {
                employees = [];
            }

        } catch (error) {

            console.error(
                "Erro ao carregar colaboradores:",
                error
            );

            employees = [];

        }

    }


    function saveEmployees() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(employees)
            );

            /*
             * Se o database.js disponibilizar uma função
             * global para persistência, também tentamos usá-la.
             */

            if (
                typeof window.databaseSave === "function"
            ) {

                window.databaseSave(
                    "equipe",
                    employees
                );

            }

        } catch (error) {

            console.error(
                "Erro ao salvar colaboradores:",
                error
            );

            showToast(
                "Não foi possível salvar os dados.",
                "error"
            );

        }

    }


    /* =====================================================
       ID
       ===================================================== */

    function generateId() {

        return (
            "EMP-" +
            Date.now().toString(36).toUpperCase() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase()
        );

    }


    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    function escapeHTML(value) {

        if (value === null || value === undefined) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getInitials(name) {

        if (!name) {
            return "CL";
        }

        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 1) {
            return parts[0]
                .substring(0, 2)
                .toUpperCase();
        }

        return (
            parts[0][0] +
            parts[parts.length - 1][0]
        ).toUpperCase();

    }


    function formatPhone(phone) {

        if (!phone) {
            return "—";
        }

        const numbers =
            String(phone).replace(/\D/g, "");

        if (numbers.length === 11) {

            return numbers.replace(
                /^(\d{2})(\d{5})(\d{4})$/,
                "($1) $2-$3"
            );

        }

        if (numbers.length === 10) {

            return numbers.replace(
                /^(\d{2})(\d{4})(\d{4})$/,
                "($1) $2-$3"
            );

        }

        return phone;

    }


    function formatDate(date) {

        if (!date) {
            return "—";
        }

        const parsed =
            new Date(date + "T00:00:00");

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString(
            "pt-BR"
        );

    }


    /* =====================================================
       STATUS
       ===================================================== */

    function getStatusClass(status) {

        switch (status) {

            case "Ativo":
                return "status-active";

            case "Férias":
                return "status-vacation";

            case "Afastado":
                return "status-away";

            default:
                return "status-inactive";

        }

    }


    /* =====================================================
       INDICADORES
       ===================================================== */

    function updateStats() {

        const total =
            employees.length;

        const active =
            employees.filter(
                employee =>
                    employee.status === "Ativo"
            ).length;

        const inactive =
            employees.filter(
                employee =>
                    employee.status === "Afastado" ||
                    employee.status === "Inativo"
            ).length;

        const departments =
            new Set(
                employees
                    .map(employee => employee.department)
                    .filter(Boolean)
            ).size;


        setText(
            "totalEmployees",
            total
        );

        setText(
            "activeEmployees",
            active
        );

        setText(
            "inactiveEmployees",
            inactive
        );

        setText(
            "totalDepartments",
            departments
        );

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    }


    /* =====================================================
       FILTROS
       ===================================================== */

    function populateDepartmentFilter() {

        if (!departmentFilter) {
            return;
        }

        const currentValue =
            departmentFilter.value;

        const departments =
            [...new Set(
                employees
                    .map(employee => employee.department)
                    .filter(Boolean)
            )].sort(
                (a, b) =>
                    a.localeCompare(
                        b,
                        "pt-BR"
                    )
            );


        departmentFilter.innerHTML =
            `<option value="">Todos os setores</option>`;


        departments.forEach(department => {

            const option =
                document.createElement("option");

            option.value = department;

            option.textContent = department;

            departmentFilter.appendChild(option);

        });


        if (
            departments.includes(currentValue)
        ) {

            departmentFilter.value =
                currentValue;

        }

    }


    function applyFilters() {

        const search =
            employeeSearch
                ? employeeSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const department =
            departmentFilter
                ? departmentFilter.value
                : "";

        const status =
            statusFilter
                ? statusFilter.value
                : "";


        filteredEmployees =
            employees.filter(employee => {

                const searchableText = [

                    employee.name,

                    employee.position,

                    employee.department,

                    employee.email,

                    employee.phone

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                const matchesSearch =
                    !search ||
                    searchableText.includes(search);


                const matchesDepartment =
                    !department ||
                    employee.department === department;


                const matchesStatus =
                    !status ||
                    employee.status === status;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesStatus
                );

            });


        currentPage = 1;

        renderTable();

    }


    /* =====================================================
       RENDERIZAÇÃO
       ===================================================== */

    function renderTable() {

        if (!employeeTableBody) {
            return;
        }


        const total =
            filteredEmployees.length;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total / ITEMS_PER_PAGE
                )
            );


        if (currentPage > totalPages) {
            currentPage = totalPages;
        }


        const start =
            (currentPage - 1) *
            ITEMS_PER_PAGE;


        const end =
            Math.min(
                start + ITEMS_PER_PAGE,
                total
            );


        const pageItems =
            filteredEmployees.slice(
                start,
                end
            );


        employeeTableBody.innerHTML = "";


        if (pageItems.length === 0) {

            showEmptyState(true);

        } else {

            showEmptyState(false);

            pageItems.forEach(employee => {

                employeeTableBody.appendChild(
                    createEmployeeRow(employee)
                );

            });

        }


        updatePagination(
            total,
            start,
            end,
            totalPages
        );


        setText(
            "employeesResultCount",
            `${total} ${
                total === 1
                    ? "colaborador"
                    : "colaboradores"
            }`
        );

    }


    function createEmployeeRow(employee) {

        const row =
            document.createElement("tr");


        const statusClass =
            getStatusClass(
                employee.status
            );


        const initials =
            getInitials(
                employee.name
            );


        row.innerHTML = `

            <td>

                <div class="employee-cell">

                    <div class="employee-avatar">
                        ${escapeHTML(initials)}
                    </div>

                    <div class="employee-info">

                        <strong>
                            ${escapeHTML(
                                employee.name
                            )}
                        </strong>

                        <span>
                            ${
                                employee.admission
                                    ? "Admissão: " +
                                      formatDate(
                                          employee.admission
                                      )
                                    : "Colaborador"
                            }
                        </span>

                    </div>

                </div>

            </td>


            <td>
                ${escapeHTML(
                    employee.position || "—"
                )}
            </td>


            <td>
                ${escapeHTML(
                    employee.department || "—"
                )}
            </td>


            <td>
                ${escapeHTML(
                    formatPhone(
                        employee.phone
                    )
                )}
            </td>


            <td>
                ${escapeHTML(
                    employee.email || "—"
                )}
            </td>


            <td>

                <span
                    class="status-badge ${statusClass}"
                >

                    ${escapeHTML(
                        employee.status || "Inativo"
                    )}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="table-action-button"
                        data-action="edit"
                        data-id="${escapeHTML(
                            employee.id
                        )}"
                        title="Editar"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="table-action-button delete"
                        data-action="delete"
                        data-id="${escapeHTML(
                            employee.id
                        )}"
                        title="Excluir"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        `;


        return row;

    }


    function showEmptyState(show) {

        const empty =
            document.getElementById(
                "employeesEmptyState"
            );

        if (empty) {
            empty.hidden = !show;
        }

    }


    /* =====================================================
       PAGINAÇÃO
       ===================================================== */

    function updatePagination(
        total,
        start,
        end,
        totalPages
    ) {

        const info =
            document.getElementById(
                "employeesPaginationInfo"
            );


        if (info) {

            if (total === 0) {

                info.textContent =
                    "Mostrando 0–0 de 0 colaboradores";

            } else {

                info.textContent =
                    `Mostrando ${
                        start + 1
                    }–${end} de ${total} colaboradores`;

            }

        }


        setText(
            "currentEmployeePage",
            currentPage
        );


        const previous =
            document.getElementById(
                "previousEmployeePage"
            );

        const next =
            document.getElementById(
                "nextEmployeePage"
            );


        if (previous) {

            previous.disabled =
                currentPage <= 1;

        }


        if (next) {

            next.disabled =
                currentPage >= totalPages;

        }

    }


    /* =====================================================
       MODAL
       ===================================================== */

    function openEmployeeModal(employee = null) {

        clearFormError();


        if (!employee) {

            employeeForm.reset();

            setValue(
                "employeeId",
                ""
            );

            setValue(
                "employeeStatus",
                "Ativo"
            );


            setText(
                "employeeModalTitle",
                "Novo colaborador"
            );

        } else {

            setValue(
                "employeeId",
                employee.id
            );

            setValue(
                "employeeName",
                employee.name
            );

            setValue(
                "employeePhone",
                employee.phone
            );

            setValue(
                "employeeEmail",
                employee.email
            );

            setValue(
                "employeePosition",
                employee.position
            );

            setValue(
                "employeeDepartment",
                employee.department
            );

            setValue(
                "employeeStatus",
                employee.status || "Ativo"
            );

            setValue(
                "employeeAdmission",
                employee.admission
            );

            setValue(
                "employeeNotes",
                employee.notes
            );


            setText(
                "employeeModalTitle",
                "Editar colaborador"
            );

        }


        employeeModal.classList.add(
            "active"
        );

        employeeModal.setAttribute(
            "aria-hidden",
            "false"
        );


        setTimeout(() => {

            const nameInput =
                document.getElementById(
                    "employeeName"
                );

            if (nameInput) {
                nameInput.focus();
            }

        }, 100);

    }


    function closeEmployeeModal() {

        employeeModal.classList.remove(
            "active"
        );

        employeeModal.setAttribute(
            "aria-hidden",
            "true"
        );

        clearFormError();

    }


    function openDeleteModal(employee) {

        employeeToDelete =
            employee;


        setText(
            "deleteEmployeeName",
            employee.name
        );


        deleteEmployeeModal.classList.add(
            "active"
        );

        deleteEmployeeModal.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    function closeDeleteModal() {

        employeeToDelete = null;

        deleteEmployeeModal.classList.remove(
            "active"
        );

        deleteEmployeeModal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    function setValue(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value =
                value ?? "";
        }

    }


    /* =====================================================
       FORMULÁRIO
       ===================================================== */

    function handleEmployeeSubmit(event) {

        event.preventDefault();


        const name =
            getValue("employeeName").trim();

        const phone =
            getValue("employeePhone").trim();

        const email =
            getValue("employeeEmail").trim();

        const position =
            getValue("employeePosition").trim();

        const department =
            getValue("employeeDepartment").trim();

        const status =
            getValue("employeeStatus");

        const admission =
            getValue("employeeAdmission");

        const notes =
            getValue("employeeNotes").trim();

        const id =
            getValue("employeeId");


        if (!name) {

            showFormError(
                "Informe o nome do colaborador."
            );

            return;

        }


        if (!email) {

            showFormError(
                "Informe o e-mail do colaborador."
            );

            return;

        }


        if (!position) {

            showFormError(
                "Informe o cargo do colaborador."
            );

            return;

        }


        if (!department) {

            showFormError(
                "Informe o setor do colaborador."
            );

            return;

        }


        const employeeData = {

            id:
                id ||
                generateId(),

            name,

            phone,

            email,

            position,

            department,

            status:
                status || "Ativo",

            admission,

            notes,

            updatedAt:
                new Date().toISOString()

        };


        const existingIndex =
            employees.findIndex(
                employee =>
                    employee.id === id
            );


        if (existingIndex >= 0) {

            employees[existingIndex] =
                {
                    ...employees[existingIndex],
                    ...employeeData
                };


            saveEmployees();

            populateDepartmentFilter();

            applyFilters();

            updateStats();

            closeEmployeeModal();

            showToast(
                "Colaborador atualizado com sucesso."
            );

        } else {

            employees.unshift(
                employeeData
            );

            saveEmployees();

            populateDepartmentFilter();

            applyFilters();

            updateStats();

            closeEmployeeModal();

            showToast(
                "Colaborador cadastrado com sucesso."
            );

        }

    }


    function getValue(id) {

        const element =
            document.getElementById(id);

        return element
            ? element.value
            : "";

    }


    function showFormError(message) {

        const error =
            document.getElementById(
                "employeeFormError"
            );


        if (!error) {
            return;
        }


        const span =
            error.querySelector("span");


        if (span) {
            span.textContent = message;
        }


        error.hidden = false;

    }


    function clearFormError() {

        const error =
            document.getElementById(
                "employeeFormError"
            );


        if (error) {
            error.hidden = true;
        }

    }


    /* =====================================================
       EXCLUSÃO
       ===================================================== */

    function confirmDelete() {

        if (!employeeToDelete) {
            return;
        }


        employees =
            employees.filter(
                employee =>
                    employee.id !==
                    employeeToDelete.id
            );


        saveEmployees();

        populateDepartmentFilter();

        applyFilters();

        updateStats();

        closeDeleteModal();


        showToast(
            "Colaborador excluído com sucesso."
        );

    }


    /* =====================================================
       EXPORTAÇÃO CSV
       ===================================================== */

    function exportEmployees() {

        if (employees.length === 0) {

            showToast(
                "Não existem colaboradores para exportar.",
                "error"
            );

            return;

        }


        const headers = [

            "Nome",
            "Cargo",
            "Setor",
            "Telefone",
            "E-mail",
            "Status",
            "Data de admissão",
            "Observações"

        ];


        const rows =
            employees.map(employee => [

                employee.name,
                employee.position,
                employee.department,
                employee.phone,
                employee.email,
                employee.status,
                employee.admission,
                employee.notes

            ]);


        const csv = [

            headers,

            ...rows

        ]
            .map(row =>
                row.map(value =>
                    `"${String(
                        value ?? ""
                    ).replace(
                        /"/g,
                        '""'
                    )}"`
                ).join(";")
            )
            .join("\n");


        const blob =
            new Blob(
                ["\ufeff" + csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href = url;

        link.download =
            `atlas-equipe-${getFileDate()}.csv`;


        document.body.appendChild(link);

        link.click();

        link.remove();


        URL.revokeObjectURL(url);


        showToast(
            "Lista de colaboradores exportada."
        );

    }


    function getFileDate() {

        const date =
            new Date();


        return [

            date.getFullYear(),

            String(
                date.getMonth() + 1
            ).padStart(2, "0"),

            String(
                date.getDate()
            ).padStart(2, "0")

        ].join("-");

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        const toast =
            document.getElementById(
                "teamToast"
            );


        const toastMessage =
            document.getElementById(
                "teamToastMessage"
            );


        const icon =
            document.getElementById(
                "teamToastIcon"
            );


        if (!toast) {
            return;
        }


        if (toastMessage) {

            toastMessage.textContent =
                message;

        }


        if (icon) {

            icon.className =
                type === "error"
                    ? "fa-solid fa-circle-exclamation"
                    : "fa-solid fa-circle-check";

        }


        toast.classList.add(
            "show"
        );


        clearTimeout(toastTimer);


        toastTimer =
            setTimeout(() => {

                toast.classList.remove(
                    "show"
                );

            }, 3500);

    }


    /* =====================================================
       NOTIFICAÇÕES
       ===================================================== */

    function updateNotifications() {

        const notifications = [];


        const inactive =
            employees.filter(
                employee =>
                    employee.status === "Afastado"
            );


        inactive.forEach(employee => {

            notifications.push({

                type: "warning",

                title:
                    "Colaborador afastado",

                message:
                    `${employee.name} está marcado como afastado.`

            });

        });


        const count =
            notifications.length;


        setText(
            "notificationCount",
            count
        );


        setText(
            "notificationSubtitle",
            `${count} pendentes`
        );


        const list =
            document.getElementById(
                "notificationList"
            );


        if (!list) {
            return;
        }


        if (notifications.length === 0) {

            list.innerHTML = `

                <div class="notification-empty">

                    <i class="fa-regular fa-bell-slash"></i>

                    <span>
                        Nenhuma notificação pendente.
                    </span>

                </div>

            `;

            return;

        }


        list.innerHTML =
            notifications.map(item => `

                <div class="notification-item">

                    <div class="notification-item-icon">

                        <i class="fa-solid fa-triangle-exclamation"></i>

                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <span>
                            ${escapeHTML(item.message)}
                        </span>

                    </div>

                </div>

            `).join("");

    }


    /* =====================================================
       PERFIL / LOGOUT
       ===================================================== */

    function setupProfile() {

        const buttons = [

            document.getElementById(
                "profileButton"
            ),

            document.getElementById(
                "profileButtonTop"
            )

        ].filter(Boolean);


        const menu =
            document.getElementById(
                "profileMenu"
            );


        if (!menu) {
            return;
        }


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    menu.classList.toggle(
                        "active"
                    );

                }
            );

        });


        document.addEventListener(
            "click",
            event => {

                if (
                    !menu.contains(
                        event.target
                    )
                ) {

                    menu.classList.remove(
                        "active"
                    );

                }

            }
        );


        const logout =
            document.getElementById(
                "logoutButton"
            );


        if (logout) {

            logout.addEventListener(
                "click",
                () => {

                    try {

                        localStorage.removeItem(
                            "atlas_session"
                        );

                    } catch (error) {

                        console.error(error);

                    }


                    window.location.href =
                        "index.html";

                }
            );

        }

    }


    /* =====================================================
       SIDEBAR MOBILE
       ===================================================== */

    function setupSidebar() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );

        const overlay =
            document.getElementById(
                "sidebarOverlay"
            );

        const toggle =
            document.getElementById(
                "sidebarToggle"
            );

        const close =
            document.getElementById(
                "sidebarClose"
            );


        function openSidebar() {

            if (sidebar) {
                sidebar.classList.add(
                    "open"
                );
            }

            if (overlay) {
                overlay.classList.add(
                    "active"
                );
            }

        }


        function closeSidebar() {

            if (sidebar) {
                sidebar.classList.remove(
                    "open"
                );
            }

            if (overlay) {
                overlay.classList.remove(
                    "active"
                );
            }

        }


        if (toggle) {
            toggle.addEventListener(
                "click",
                openSidebar
            );
        }


        if (close) {
            close.addEventListener(
                "click",
                closeSidebar
            );
        }


        if (overlay) {
            overlay.addEventListener(
                "click",
                closeSidebar
            );
        }

    }


    /* =====================================================
       EVENTOS
       ===================================================== */

    function setupEvents() {

        const newButton =
            document.getElementById(
                "newEmployeeButton"
            );


        const emptyButton =
            document.getElementById(
                "emptyNewEmployeeButton"
            );


        if (newButton) {

            newButton.addEventListener(
                "click",
                () =>
                    openEmployeeModal()
            );

        }


        if (emptyButton) {

            emptyButton.addEventListener(
                "click",
                () =>
                    openEmployeeModal()
            );

        }


        const closeButton =
            document.getElementById(
                "closeEmployeeModal"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                closeEmployeeModal
            );

        }


        const cancelButton =
            document.getElementById(
                "cancelEmployee"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                closeEmployeeModal
            );

        }


        const cancelDelete =
            document.getElementById(
                "cancelDeleteEmployee"
            );


        if (cancelDelete) {

            cancelDelete.addEventListener(
                "click",
                closeDeleteModal
            );

        }


        const confirmDelete =
            document.getElementById(
                "confirmDeleteEmployee"
            );


        if (confirmDelete) {

            confirmDelete.addEventListener(
                "click",
                confirmDelete
            );

        }


        employeeForm.addEventListener(
            "submit",
            handleEmployeeSubmit
        );


        if (employeeSearch) {

            employeeSearch.addEventListener(
                "input",
                applyFilters
            );

        }


        if (departmentFilter) {

            departmentFilter.addEventListener(
                "change",
                applyFilters
            );

        }


        if (statusFilter) {

            statusFilter.addEventListener(
                "change",
                applyFilters
            );

        }


        const clearFilters =
            document.getElementById(
                "clearEmployeeFilters"
            );


        if (clearFilters) {

            clearFilters.addEventListener(
                "click",
                () => {

                    if (employeeSearch) {
                        employeeSearch.value = "";
                    }

                    if (departmentFilter) {
                        departmentFilter.value = "";
                    }

                    if (statusFilter) {
                        statusFilter.value = "";
                    }

                    applyFilters();

                }
            );

        }


        employeeTableBody.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-action]"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                const employee =
                    employees.find(
                        item =>
                            item.id === id
                    );


                if (!employee) {
                    return;
                }


                if (
                    button.dataset.action ===
                    "edit"
                ) {

                    openEmployeeModal(
                        employee
                    );

                }


                if (
                    button.dataset.action ===
                    "delete"
                ) {

                    openDeleteModal(
                        employee
                    );

                }

            }
        );


        const previous =
            document.getElementById(
                "previousEmployeePage"
            );


        if (previous) {

            previous.addEventListener(
                "click",
                () => {

                    if (currentPage > 1) {

                        currentPage--;

                        renderTable();

                    }

                }
            );

        }


        const next =
            document.getElementById(
                "nextEmployeePage"
            );


        if (next) {

            next.addEventListener(
                "click",
                () => {

                    const pages =
                        Math.ceil(
                            filteredEmployees.length /
                            ITEMS_PER_PAGE
                        );


                    if (
                        currentPage <
                        pages
                    ) {

                        currentPage++;

                        renderTable();

                    }

                }
            );

        }


        const exportButton =
            document.getElementById(
                "exportEmployeesButton"
            );


        if (exportButton) {

            exportButton.addEventListener(
                "click",
                exportEmployees
            );

        }


        const closeToast =
            document.getElementById(
                "closeTeamToast"
            );


        if (closeToast) {

            closeToast.addEventListener(
                "click",
                () => {

                    const toast =
                        document.getElementById(
                            "teamToast"
                        );

                    if (toast) {
                        toast.classList.remove(
                            "show"
                        );
                    }

                }
            );

        }


        const notificationButton =
            document.getElementById(
                "notificationButton"
            );


        const notificationPanel =
            document.getElementById(
                "notificationPanel"
            );


        if (
            notificationButton &&
            notificationPanel
        ) {

            notificationButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    notificationPanel.classList.toggle(
                        "active"
                    );

                }
            );


            document.addEventListener(
                "click",
                event => {

                    if (
                        !notificationPanel.contains(
                            event.target
                        ) &&
                        event.target !==
                            notificationButton
                    ) {

                        notificationPanel.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        const markRead =
            document.getElementById(
                "markNotificationsRead"
            );


        if (markRead) {

            markRead.addEventListener(
                "click",
                () => {

                    const panel =
                        document.getElementById(
                            "notificationPanel"
                        );

                    if (panel) {
                        panel.classList.remove(
                            "active"
                        );
                    }

                }
            );

        }


        employeeModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    employeeModal
                ) {

                    closeEmployeeModal();

                }

            }
        );


        deleteEmployeeModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    deleteEmployeeModal
                ) {

                    closeDeleteModal();

                }

            }
        );


        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape"
                ) {

                    closeEmployeeModal();

                    closeDeleteModal();

                }

            }
        );

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function init() {

        loadEmployees();

        populateDepartmentFilter();

        applyFilters();

        updateStats();

        updateNotifications();

        setupEvents();

        setupProfile();

        setupSidebar();

    }


    init();

});
```
