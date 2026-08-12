document.addEventListener("DOMContentLoaded", () => {

    const STORAGE_KEY = "atlas_inspecoes";

    let inspections = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );


    const $ = (id) => document.getElementById(id);


    /* =========================
       BANCO DE DADOS
    ========================= */

    function saveDatabase() {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(inspections)
        );

    }


    /* =========================
       ESCAPE HTML
    ========================= */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================
       NOTIFICAÇÃO
    ========================= */

    function showToast(message) {

        $("toastText").textContent = message;

        $("toast").classList.add("show");

        setTimeout(() => {

            $("toast").classList.remove("show");

        }, 2500);

    }


    /* =========================
       INDICADORES
    ========================= */

    function updateIndicators() {

        const total = inspections.length;

        const conforme = inspections.filter(
            item => item.result === "Conforme"
        ).length;

        const naoConforme = inspections.filter(
            item => item.result === "Não Conforme"
        ).length;

        const pendentes = inspections.filter(
            item => item.status === "Pendente"
        ).length;

        const ncAbertas = inspections.filter(
            item =>
                item.result === "Não Conforme" &&
                item.status !== "Concluída"
        ).length;

        const acoesConcluidas = inspections.filter(
            item =>
                item.correctiveAction &&
                item.status === "Concluída"
        ).length;


        const taxa = total > 0
            ? Math.round((conforme / total) * 100)
            : 0;


        $("totalInspections").textContent = total;

        $("totalConforme").textContent = conforme;

        $("totalNC").textContent = naoConforme;

        $("complianceRate").textContent = `${taxa}%`;

        $("donutPercent").textContent = `${taxa}%`;

        $("legendConforme").textContent = conforme;

        $("legendNC").textContent = naoConforme;

        $("pendingCount").textContent = pendentes;

        $("openNC").textContent = ncAbertas;

        $("closedActions").textContent = acoesConcluidas;

        $("notificationCount").textContent = ncAbertas;


        const graus = taxa * 3.6;

        $("donut").style.background =
            `conic-gradient(
                #22c55e 0deg ${graus}deg,
                #ef4444 ${graus}deg 360deg
            )`;

    }


    /* =========================
       RENDERIZAR TABELA
    ========================= */

    function renderTable() {

        const search =
            $("searchInspection").value
                .toLowerCase()
                .trim();

        const resultFilter =
            $("resultFilter").value;

        const statusFilter =
            $("statusFilter").value;


        const filtered = inspections.filter(item => {

            const searchMatch =
                !search ||
                item.product.toLowerCase().includes(search) ||
                item.responsible.toLowerCase().includes(search) ||
                (item.description || "")
                    .toLowerCase()
                    .includes(search);


            const resultMatch =
                !resultFilter ||
                item.result === resultFilter;


            const statusMatch =
                !statusFilter ||
                item.status === statusFilter;


            return (
                searchMatch &&
                resultMatch &&
                statusMatch
            );

        });


        $("resultCount").textContent =
            `${filtered.length} ${
                filtered.length === 1
                    ? "registro"
                    : "registros"
            }`;


        $("inspectionTable").innerHTML =
            filtered.map(item => {

                let resultClass = "orange";

                if (item.result === "Conforme") {
                    resultClass = "green";
                }

                if (item.result === "Não Conforme") {
                    resultClass = "red";
                }


                let statusClass = "gray";

                if (item.status === "Concluída") {
                    statusClass = "green";
                }

                if (item.status === "Pendente") {
                    statusClass = "orange";
                }


                const date =
                    item.date
                        ? new Date(
                            item.date + "T00:00:00"
                        ).toLocaleDateString("pt-BR")
                        : "-";


                return `

                    <tr>

                        <td>
                            <strong>
                                ${escapeHTML(item.product)}
                            </strong>
                        </td>

                        <td>
                            ${escapeHTML(item.responsible)}
                        </td>

                        <td>
                            ${date}
                        </td>

                        <td>

                            <span class="badge ${resultClass}">
                                ${escapeHTML(item.result)}
                            </span>

                        </td>

                        <td>

                            <span class="badge ${statusClass}">
                                ${escapeHTML(item.status)}
                            </span>

                        </td>

                        <td>
                            ${escapeHTML(
                                item.correctiveAction || "—"
                            )}
                        </td>

                        <td>

                            <div class="row-actions">

                                <button
                                    data-edit="${item.id}"
                                    title="Editar"
                                >

                                    <i class="fa-solid fa-pen"></i>

                                </button>


                                <button
                                    class="delete"
                                    data-delete="${item.id}"
                                    title="Excluir"
                                >

                                    <i class="fa-solid fa-trash"></i>

                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            }).join("");


        $("emptyState").style.display =
            filtered.length === 0
                ? "block"
                : "none";


        updateIndicators();

    }


    /* =========================
       ABRIR MODAL
    ========================= */

    function openModal(item = null) {

        $("inspectionModal")
            .classList
            .add("active");


        $("formError").style.display = "none";


        if (item) {

            $("modalTitle").textContent =
                "Editar inspeção";


            $("inspectionId").value =
                item.id;

            $("product").value =
                item.product;

            $("responsible").value =
                item.responsible;

            $("inspectionDate").value =
                item.date;

            $("result").value =
                item.result;

            $("inspectionStatus").value =
                item.status;

            $("description").value =
                item.description || "";

            $("correctiveAction").value =
                item.correctiveAction || "";

        } else {

            $("modalTitle").textContent =
                "Nova inspeção";


            $("inspectionForm").reset();

            $("inspectionId").value = "";

            $("result").value =
                "Conforme";

            $("inspectionStatus").value =
                "Concluída";


            const today =
                new Date()
                    .toISOString()
                    .split("T")[0];


            $("inspectionDate").value =
                today;

        }

    }


    /* =========================
       FECHAR MODAL
    ========================= */

    function closeModal() {

        $("inspectionModal")
            .classList
            .remove("active");

    }


    /* =========================
       NOVA INSPEÇÃO
    ========================= */

    $("newInspection").addEventListener(
        "click",
        () => openModal()
    );


    $("closeModal").addEventListener(
        "click",
        closeModal
    );


    $("cancelModal").addEventListener(
        "click",
        closeModal
    );


    /* =========================
       SALVAR
    ========================= */

    $("inspectionForm").addEventListener(
        "submit",
        (event) => {

            event.preventDefault();


            const product =
                $("product").value.trim();

            const responsible =
                $("responsible").value.trim();

            const date =
                $("inspectionDate").value;


            if (!product || !responsible || !date) {

                $("formError").textContent =
                    "Preencha todos os campos obrigatórios.";

                $("formError").style.display =
                    "block";

                return;

            }


            const id =
                $("inspectionId").value ||
                Date.now().toString();


            const inspection = {

                id,

                product,

                responsible,

                date,

                result:
                    $("result").value,

                status:
                    $("inspectionStatus").value,

                description:
                    $("description").value.trim(),

                correctiveAction:
                    $("correctiveAction").value.trim()

            };


            const existingIndex =
                inspections.findIndex(
                    item => item.id === id
                );


            if (existingIndex >= 0) {

                inspections[existingIndex] =
                    inspection;

                showToast(
                    "Inspeção atualizada com sucesso!"
                );

            } else {

                inspections.unshift(
                    inspection
                );

                showToast(
                    "Inspeção cadastrada com sucesso!"
                );

            }


            saveDatabase();

            renderTable();

            closeModal();

        }
    );


    /* =========================
       EDITAR / EXCLUIR
    ========================= */

    $("inspectionTable").addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    "[data-edit]"
                );


            const deleteButton =
                event.target.closest(
                    "[data-delete]"
                );


            if (editButton) {

                const id =
                    editButton.dataset.edit;


                const item =
                    inspections.find(
                        inspection =>
                            inspection.id === id
                    );


                if (item) {

                    openModal(item);

                }

            }


            if (deleteButton) {

                const id =
                    deleteButton.dataset.delete;


                const confirmDelete =
                    confirm(
                        "Deseja realmente excluir esta inspeção?"
                    );


                if (!confirmDelete) {
                    return;
                }


                inspections =
                    inspections.filter(
                        item => item.id !== id
                    );


                saveDatabase();

                renderTable();

                showToast(
                    "Inspeção excluída."
                );

            }

        }
    );


    /* =========================
       FILTROS
    ========================= */

    $("searchInspection")
        .addEventListener(
            "input",
            renderTable
        );


    $("resultFilter")
        .addEventListener(
            "change",
            renderTable
        );


    $("statusFilter")
        .addEventListener(
            "change",
            renderTable
        );


    /* =========================
       MENU MOBILE
    ========================= */

    $("sidebarToggle")
        .addEventListener(
            "click",
            () => {

                $("sidebar")
                    .classList
                    .toggle("open");

            }
        );


    /* =========================
       NOTIFICAÇÕES
    ========================= */

    $("notificationButton")
        .addEventListener(
            "click",
            () => {

                const abertas =
                    inspections.filter(
                        item =>
                            item.result ===
                            "Não Conforme" &&
                            item.status !==
                            "Concluída"
                    ).length;


                if (abertas > 0) {

                    alert(
                        `Você possui ${abertas} não conformidade(s) em aberto.`
                    );

                } else {

                    alert(
                        "Não existem notificações pendentes."
                    );

                }

            }
        );


    /* =========================
       INICIALIZAÇÃO
    ========================= */

    renderTable();

});
