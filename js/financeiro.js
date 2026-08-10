```javascript
/* =========================================================
   ATLAS GESTÃO
   FINANCEIRO.JS
   Módulo Financeiro
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const FINANCE_CONFIG = {

    storageKey: "atlas_financeiro",

    itemsPerPage: 10,

    currency: "BRL",

    locale: "pt-BR",

    defaultCategories: [
        "Vendas",
        "Serviços",
        "Salários",
        "Fornecedores",
        "Aluguel",
        "Energia",
        "Marketing",
        "Impostos",
        "Transporte",
        "Equipamentos",
        "Outros"
    ]

};


/* =========================================================
   ESTADO
   ========================================================= */

const financeState = {

    transactions: [],

    filteredTransactions: [],

    currentPage: 1,

    editingId: null,

    deletingId: null,

    financeChart: null,

    expenseChart: null,

    toastTimer: null

};


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

/**
 * Busca um elemento pelo ID.
 */
function getElement(id) {

    return document.getElementById(id);

}


/**
 * Formata número como moeda brasileira.
 */
function formatCurrency(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat(
        FINANCE_CONFIG.locale,
        {
            style: "currency",
            currency: FINANCE_CONFIG.currency
        }
    ).format(number);

}


/**
 * Formata número compacto.
 */
function formatCompactCurrency(value) {

    const number = Number(value) || 0;

    if (Math.abs(number) >= 1000000) {

        return `R$ ${(number / 1000000)
            .toFixed(1)
            .replace(".", ",")} mi`;

    }

    if (Math.abs(number) >= 1000) {

        return `R$ ${(number / 1000)
            .toFixed(1)
            .replace(".", ",")} mil`;

    }

    return formatCurrency(number);

}


/**
 * Converte data para Date.
 */
function parseDate(dateValue) {

    if (!dateValue) {

        return null;

    }

    if (dateValue instanceof Date) {

        return dateValue;

    }

    const date = new Date(dateValue);

    if (!Number.isNaN(date.getTime())) {

        return date;

    }

    const parts = String(dateValue).split("/");

    if (parts.length === 3) {

        const [day, month, year] = parts;

        return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
        );

    }

    return null;

}


/**
 * Data para YYYY-MM-DD.
 */
function formatDateInput(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return "";

    }

    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/**
 * Data para visualização.
 */
function formatDateBR(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return "-";

    }

    return new Intl.DateTimeFormat(
        FINANCE_CONFIG.locale
    ).format(date);

}


/**
 * Gera ID único.
 */
function generateId() {

    return `fin_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;

}


/**
 * Escapa HTML.
 */
function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent =
        value === null || value === undefined
            ? ""
            : String(value);

    return div.innerHTML;

}


/**
 * Obtém data atual.
 */
function getToday() {

    const date = new Date();

    return formatDateInput(date);

}


/**
 * Verifica se uma data pertence ao mês atual.
 */
function isCurrentMonth(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return false;

    }

    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    );

}


/**
 * Verifica se pertence ao ano atual.
 */
function isCurrentYear(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return false;

    }

    const now = new Date();

    return (
        date.getFullYear() === now.getFullYear()
    );

}


/**
 * Retorna início da semana.
 */
function getStartOfWeek() {

    const date = new Date();

    const day = date.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    date.setDate(
        date.getDate() + difference
    );

    date.setHours(0, 0, 0, 0);

    return date;

}


/**
 * Verifica se está nesta semana.
 */
function isCurrentWeek(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return false;

    }

    date.setHours(0, 0, 0, 0);

    const start = getStartOfWeek();

    const end = new Date(start);

    end.setDate(
        end.getDate() + 6
    );

    end.setHours(23, 59, 59, 999);

    return (
        date >= start &&
        date <= end
    );

}


/**
 * Verifica se é hoje.
 */
function isToday(dateValue) {

    const date = parseDate(dateValue);

    if (!date) {

        return false;

    }

    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );

}


/* =========================================================
   BANCO DE DADOS
   ========================================================= */

/**
 * Tenta obter dados através do database.js.
 */
function getDatabaseObject() {

    if (
        typeof window.atlasDB !== "undefined"
    ) {

        return window.atlasDB;

    }

    if (
        typeof window.database !== "undefined"
    ) {

        return window.database;

    }

    if (
        typeof window.Database !== "undefined"
    ) {

        return window.Database;

    }

    return null;

}


/**
 * Lê movimentações.
 */
async function loadTransactionsFromDatabase() {

    const db = getDatabaseObject();

    try {

        if (
            db &&
            typeof db.getTransactions === "function"
        ) {

            const result =
                await db.getTransactions();

            return normalizeTransactions(result);

        }


        if (
            db &&
            typeof db.getFinanceiro === "function"
        ) {

            const result =
                await db.getFinanceiro();

            return normalizeTransactions(result);

        }


        if (
            db &&
            typeof db.getFinancialTransactions === "function"
        ) {

            const result =
                await db.getFinancialTransactions();

            return normalizeTransactions(result);

        }

    } catch (error) {

        console.error(
            "Erro ao carregar banco:",
            error
        );

    }


    return loadTransactionsFromLocalStorage();

}


/**
 * Salva movimentações no banco.
 */
async function saveTransactionsToDatabase(
    transactions
) {

    const db = getDatabaseObject();

    try {

        if (
            db &&
            typeof db.saveTransactions === "function"
        ) {

            await db.saveTransactions(
                transactions
            );

            return true;

        }


        if (
            db &&
            typeof db.saveFinanceiro === "function"
        ) {

            await db.saveFinanceiro(
                transactions
            );

            return true;

        }


        if (
            db &&
            typeof db.saveFinancialTransactions === "function"
        ) {

            await db.saveFinancialTransactions(
                transactions
            );

            return true;

        }

    } catch (error) {

        console.error(
            "Erro ao salvar banco:",
            error
        );

    }


    return saveTransactionsToLocalStorage(
        transactions
    );

}


/**
 * Normaliza dados vindos do banco.
 */
function normalizeTransactions(data) {

    let list = data;

    if (
        data &&
        Array.isArray(data.data)
    ) {

        list = data.data;

    }

    if (
        data &&
        Array.isArray(data.items)
    ) {

        list = data.items;

    }

    if (!Array.isArray(list)) {

        return [];

    }

    return list.map(
        normalizeTransaction
    );

}


/**
 * Normaliza uma movimentação.
 */
function normalizeTransaction(item) {

    const transaction = item || {};

    return {

        id:
            transaction.id ||
            transaction._id ||
            generateId(),

        tipo:
            normalizeType(
                transaction.tipo ||
                transaction.type ||
                transaction.tipoMovimentacao
            ),

        categoria:
            transaction.categoria ||
            transaction.category ||
            "Outros",

        descricao:
            transaction.descricao ||
            transaction.description ||
            "",

        valor:
            Number(
                transaction.valor ??
                transaction.value ??
                transaction.amount ??
                0
            ),

        data:
            formatDateInput(
                transaction.data ||
                transaction.date ||
                transaction.createdAt
            ),

        formaPagamento:
            transaction.formaPagamento ||
            transaction.paymentMethod ||
            transaction.forma_pagamento ||
            "",

        createdAt:
            transaction.createdAt ||
            new Date().toISOString(),

        updatedAt:
            transaction.updatedAt ||
            new Date().toISOString()

    };

}


/**
 * Normaliza tipo.
 */
function normalizeType(type) {

    const value =
        String(type || "")
            .toLowerCase()
            .trim();

    if (
        value === "despesa" ||
        value === "expense" ||
        value === "saida" ||
        value === "saída"
    ) {

        return "despesa";

    }

    return "receita";

}


/**
 * LocalStorage - leitura.
 */
function loadTransactionsFromLocalStorage() {

    try {

        const saved =
            localStorage.getItem(
                FINANCE_CONFIG.storageKey
            );

        if (!saved) {

            return [];

        }

        return normalizeTransactions(
            JSON.parse(saved)
        );

    } catch (error) {

        console.error(
            "Erro ao ler LocalStorage:",
            error
        );

        return [];

    }

}


/**
 * LocalStorage - gravação.
 */
function saveTransactionsToLocalStorage(
    transactions
) {

    try {

        localStorage.setItem(
            FINANCE_CONFIG.storageKey,
            JSON.stringify(transactions)
        );

        return true;

    } catch (error) {

        console.error(
            "Erro ao salvar LocalStorage:",
            error
        );

        return false;

    }

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeFinancePage
);


async function initializeFinancePage() {

    setDefaultDate();

    setupFinanceEvents();

    await loadFinanceData();

    updateUserInterface();

    updateDashboardCards();

    updateCategoryFilters();

    applyFilters();

    updateNotifications();

}


/**
 * Carrega dados.
 */
async function loadFinanceData() {

    const transactions =
        await loadTransactionsFromDatabase();

    financeState.transactions =
        Array.isArray(transactions)
            ? transactions
            : [];

}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupFinanceEvents() {

    setupSidebar();

    setupProfileMenu();

    setupNotifications();

    setupTransactionModal();

    setupTransactionFilters();

    setupPagination();

    setupExport();

    setupGlobalSearch();

    setupThemeSupport();

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {

    const toggle =
        getElement("sidebarToggle");

    const close =
        getElement("sidebarClose");

    const overlay =
        getElement("sidebarOverlay");

    const sidebar =
        getElement("sidebar");


    if (toggle) {

        toggle.addEventListener(
            "click",
            () => {

                sidebar?.classList.add("open");

                overlay?.classList.add("active");

            }
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


function closeSidebar() {

    getElement("sidebar")
        ?.classList.remove("open");

    getElement("sidebarOverlay")
        ?.classList.remove("active");

}


/* =========================================================
   PERFIL
   ========================================================= */

function setupProfileMenu() {

    const button =
        getElement("profileButton");

    const menu =
        getElement("profileMenu");

    if (!button || !menu) {

        return;

    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            menu.classList.toggle("active");

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !menu.contains(event.target) &&
                !button.contains(event.target)
            ) {

                menu.classList.remove("active");

            }

        }
    );


    const logoutButtons = [

        getElement("logoutButton"),

        getElement("profileLogout")

    ];


    logoutButtons.forEach(
        buttonElement => {

            if (!buttonElement) {

                return;

            }

            buttonElement.addEventListener(
                "click",
                handleLogout
            );

        }
    );

}


/**
 * Logout.
 */
function handleLogout() {

    const confirmLogout =
        window.confirm(
            "Deseja realmente sair do Atlas Gestão?"
        );

    if (!confirmLogout) {

        return;

    }


    try {

        localStorage.removeItem(
            "atlas_logged_user"
        );

    } catch (error) {

        console.warn(error);

    }


    window.location.href =
        "index.html";

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function updateUserInterface() {

    let user = null;

    try {

        const savedUser =
            localStorage.getItem(
                "atlas_logged_user"
            );

        if (savedUser) {

            user =
                JSON.parse(savedUser);

        }

    } catch (error) {

        console.warn(
            "Usuário não pôde ser carregado.",
            error
        );

    }


    if (!user) {

        user = {

            nome: "Administrador",

            email: "admin@atlasgestao.com",

            cargo: "Administrador"

        };

    }


    const name =
        user.nome ||
        user.name ||
        "Administrador";

    const email =
        user.email ||
        "admin@atlasgestao.com";

    const role =
        user.cargo ||
        user.role ||
        "Administrador";


    const avatar =
        name
            .trim()
            .charAt(0)
            .toUpperCase();


    const elements = {

        sidebarUserName:
            name,

        sidebarUserRole:
            role,

        topbarUserName:
            name,

        topbarUserRole:
            role,

        profileMenuName:
            name,

        profileMenuEmail:
            email,

        sidebarUserAvatar:
            avatar,

        topbarAvatar:
            avatar,

        profileMenuAvatar:
            avatar

    };


    Object.entries(elements)
        .forEach(
            ([id, value]) => {

                const element =
                    getElement(id);

                if (element) {

                    element.textContent =
                        value;

                }

            }
        );

}


/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

function setupNotifications() {

    const button =
        getElement("notificationButton");

    const panel =
        getElement("notificationPanel");

    if (!button || !panel) {

        return;

    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            panel.classList.toggle(
                "active"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !panel.contains(event.target) &&
                !button.contains(event.target)
            ) {

                panel.classList.remove(
                    "active"
                );

            }

        }
    );


    const markRead =
        getElement(
            "markNotificationsRead"
        );


    if (markRead) {

        markRead.addEventListener(
            "click",
            () => {

                localStorage.setItem(
                    "atlas_finance_notifications_read",
                    "true"
                );

                updateNotifications();

            }
        );

    }

}


/**
 * Atualiza notificações.
 */
function updateNotifications() {

    const notificationList =
        getElement("notificationList");

    const countElement =
        getElement("notificationCount");

    const subtitle =
        getElement("notificationSubtitle");


    if (
        !notificationList ||
        !countElement
    ) {

        return;

    }


    const notifications = [];


    const currentMonth =
        financeState.transactions.filter(
            transaction =>
                isCurrentMonth(
                    transaction.data
                )
        );


    if (currentMonth.length === 0) {

        notifications.push({

            icon: "fa-wallet",

            text:
                "Nenhuma movimentação financeira foi registrada neste mês.",

            type: "info"

        });

    }


    const expenses =
        calculateExpenses(
            currentMonth
        );

    const revenue =
        calculateRevenue(
            currentMonth
        );


    if (
        expenses > revenue &&
        revenue > 0
    ) {

        notifications.push({

            icon: "fa-triangle-exclamation",

            text:
                "As despesas deste mês estão superiores às receitas.",

            type: "warning"

        });

    }


    const unread =
        notifications.length;


    countElement.textContent =
        unread > 9
            ? "9+"
            : String(unread);


    if (subtitle) {

        subtitle.textContent =
            `${unread} pendente${unread === 1 ? "" : "s"}`;

    }


    notificationList.innerHTML =
        notifications
            .map(
                notification => `
                    <div class="notification-item ${escapeHTML(notification.type)}">

                        <div class="notification-item-icon">

                            <i class="fa-solid ${escapeHTML(notification.icon)}"></i>

                        </div>

                        <div>

                            <p>
                                ${escapeHTML(notification.text)}
                            </p>

                        </div>

                    </div>
                `
            )
            .join("");

}


/* =========================================================
   MODAL
   ========================================================= */

function setupTransactionModal() {

    const newButtons = [

        getElement(
            "newTransactionButton"
        ),

        getElement(
            "newTransactionButtonTop"
        ),

        getElement(
            "emptyNewTransactionButton"
        )

    ];


    newButtons.forEach(
        button => {

            if (!button) {

                return;

            }

            button.addEventListener(
                "click",
                () => openTransactionModal()
            );

        }
    );


    const close =
        getElement(
            "closeTransactionModal"
        );

    const cancel =
        getElement(
            "cancelTransaction"
        );


    close?.addEventListener(
        "click",
        closeTransactionModal
    );


    cancel?.addEventListener(
        "click",
        closeTransactionModal
    );


    const modal =
        getElement(
            "transactionModal"
        );


    modal?.addEventListener(
        "click",
        event => {

            if (
                event.target === modal
            ) {

                closeTransactionModal();

            }

        }
    );


    const form =
        getElement(
            "transactionForm"
        );


    form?.addEventListener(
        "submit",
        handleTransactionSubmit
    );


    const deleteCancel =
        getElement(
            "cancelDeleteTransaction"
        );


    deleteCancel?.addEventListener(
        "click",
        closeDeleteModal
    );


    const deleteConfirm =
        getElement(
            "confirmDeleteTransaction"
        );


    deleteConfirm?.addEventListener(
        "click",
        confirmDeleteTransaction
    );


    const deleteModal =
        getElement(
            "deleteTransactionModal"
        );


    deleteModal?.addEventListener(
        "click",
        event => {

            if (
                event.target === deleteModal
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

                closeTransactionModal();

                closeDeleteModal();

            }

        }
    );

}


/**
 * Abre modal.
 */
function openTransactionModal(
    transaction = null
) {

    const modal =
        getElement(
            "transactionModal"
        );

    const form =
        getElement(
            "transactionForm"
        );

    if (!modal || !form) {

        return;

    }


    financeState.editingId =
        transaction?.id || null;


    form.reset();


    getElement(
        "transactionId"
    ).value =
        transaction?.id || "";


    getElement(
        "transactionDate"
    ).value =
        transaction?.data ||
        getToday();


    getElement(
        "transactionCategory"
    ).value =
        transaction?.categoria ||
        "";


    getElement(
        "transactionAmount"
    ).value =
        transaction
            ? transaction.valor
            : "";


    getElement(
        "transactionDescription"
    ).value =
        transaction?.descricao ||
        "";


    getElement(
        "transactionPayment"
    ).value =
        transaction?.formaPagamento ||
        "";


    const revenueRadio =
        getElement(
            "transactionRevenue"
        );

    const expenseRadio =
        getElement(
            "transactionExpense"
        );


    if (transaction) {

        if (
            transaction.tipo === "despesa"
        ) {

            expenseRadio.checked =
                true;

        } else {

            revenueRadio.checked =
                true;

        }

    } else {

        revenueRadio.checked =
            true;

    }


    const title =
        getElement(
            "transactionModalTitle"
        );


    if (title) {

        title.textContent =
            transaction
                ? "Editar movimentação"
                : "Nova movimentação";

    }


    const saveButton =
        getElement(
            "saveTransaction"
        );


    if (saveButton) {

        saveButton.innerHTML =
            transaction
                ? `
                    <i class="fa-solid fa-check"></i>
                    Atualizar movimentação
                `
                : `
                    <i class="fa-solid fa-check"></i>
                    Salvar movimentação
                `;

    }


    hideFormError();


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(
        () => {

            getElement(
                "transactionDate"
            )?.focus();

        },
        100
    );

}


/**
 * Fecha modal.
 */
function closeTransactionModal() {

    const modal =
        getElement(
            "transactionModal"
        );

    if (!modal) {

        return;

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    financeState.editingId =
        null;


    hideFormError();

}


/* =========================================================
   CRUD
   ========================================================= */

/**
 * Salva formulário.
 */
async function handleTransactionSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const formData =
        new FormData(form);


    const tipo =
        formData.get("tipo");


    const data =
        formData.get("data");


    const categoria =
        formData.get("categoria");


    const valor =
        Number(
            formData.get("valor")
        );


    const descricao =
        String(
            formData.get("descricao") || ""
        ).trim();


    const formaPagamento =
        String(
            formData.get("formaPagamento") || ""
        ).trim();


    if (!data) {

        showFormError(
            "Informe a data da movimentação."
        );

        return;

    }


    if (!categoria) {

        showFormError(
            "Selecione uma categoria."
        );

        return;

    }


    if (
        !Number.isFinite(valor) ||
        valor <= 0
    ) {

        showFormError(
            "Informe um valor maior que zero."
        );

        return;

    }


    if (!descricao) {

        showFormError(
            "Informe uma descrição para a movimentação."
        );

        return;

    }


    const existing =
        financeState.transactions.find(
            transaction =>
                transaction.id ===
                financeState.editingId
        );


    const transaction = {

        id:
            financeState.editingId ||
            generateId(),

        tipo:
            normalizeType(tipo),

        categoria,

        descricao,

        valor,

        data,

        formaPagamento,

        createdAt:
            existing?.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    if (financeState.editingId) {

        financeState.transactions =
            financeState.transactions.map(
                item =>
                    item.id ===
                    financeState.editingId
                        ? transaction
                        : item
            );

    } else {

        financeState.transactions.unshift(
            transaction
        );

    }


    await saveTransactionsToDatabase(
        financeState.transactions
    );


    closeTransactionModal();


    updateDashboardCards();

    updateCategoryFilters();

    applyFilters();

    updateNotifications();


    showToast(
        financeState.editingId
            ? "Movimentação atualizada com sucesso."
            : "Movimentação cadastrada com sucesso.",
        "success"
    );

}


/**
 * Edita movimentação.
 */
function editTransaction(id) {

    const transaction =
        financeState.transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {

        return;

    }


    openTransactionModal(
        transaction
    );

}


/**
 * Abre confirmação de exclusão.
 */
function deleteTransaction(id) {

    const transaction =
        financeState.transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {

        return;

    }


    financeState.deletingId =
        id;


    const description =
        getElement(
            "deleteTransactionDescription"
        );


    if (description) {

        description.textContent =
            `"${transaction.descricao}"`;

    }


    const modal =
        getElement(
            "deleteTransactionModal"
        );


    modal?.classList.add(
        "active"
    );


    modal?.setAttribute(
        "aria-hidden",
        "false"
    );

}


/**
 * Fecha exclusão.
 */
function closeDeleteModal() {

    const modal =
        getElement(
            "deleteTransactionModal"
        );


    modal?.classList.remove(
        "active"
    );


    modal?.setAttribute(
        "aria-hidden",
        "true"
    );


    financeState.deletingId =
        null;

}


/**
 * Confirma exclusão.
 */
async function confirmDeleteTransaction() {

    const id =
        financeState.deletingId;


    if (!id) {

        return;

    }


    financeState.transactions =
        financeState.transactions.filter(
            transaction =>
                transaction.id !== id
        );


    await saveTransactionsToDatabase(
        financeState.transactions
    );


    closeDeleteModal();


    updateDashboardCards();

    updateCategoryFilters();

    applyFilters();

    updateNotifications();


    showToast(
        "Movimentação excluída com sucesso.",
        "success"
    );

}


/* =========================================================
   FILTROS
   ========================================================= */

function setupTransactionFilters() {

    const search =
        getElement(
            "transactionSearch"
        );

    const type =
        getElement(
            "transactionTypeFilter"
        );

    const category =
        getElement(
            "transactionCategoryFilter"
        );

    const period =
        getElement(
            "transactionPeriodFilter"
        );


    search?.addEventListener(
        "input",
        debounce(
            () => {

                financeState.currentPage =
                    1;

                applyFilters();

            },
            200
        )
    );


    type?.addEventListener(
        "change",
        () => {

            financeState.currentPage =
                1;

            applyFilters();

        }
    );


    category?.addEventListener(
        "change",
        () => {

            financeState.currentPage =
                1;

            applyFilters();

        }
    );


    period?.addEventListener(
        "change",
        () => {

            financeState.currentPage =
                1;

            applyFilters();

        }
    );


    getElement(
        "clearFinanceFilters"
    )?.addEventListener(
        "click",
        clearFinanceFilters
    );

}


/**
 * Aplica filtros.
 */
function applyFilters() {

    const search =
        (
            getElement(
                "transactionSearch"
            )?.value || ""
        )
            .trim()
            .toLowerCase();


    const type =
        getElement(
            "transactionTypeFilter"
        )?.value || "";


    const category =
        getElement(
            "transactionCategoryFilter"
        )?.value || "";


    const period =
        getElement(
            "transactionPeriodFilter"
        )?.value || "";


    financeState.filteredTransactions =
        financeState.transactions.filter(
            transaction => {

                const searchMatch =
                    !search ||
                    transaction.descricao
                        .toLowerCase()
                        .includes(search) ||
                    transaction.categoria
                        .toLowerCase()
                        .includes(search) ||
                    transaction.formaPagamento
                        .toLowerCase()
                        .includes(search);


                const typeMatch =
                    !type ||
                    transaction.tipo === type;


                const categoryMatch =
                    !category ||
                    transaction.categoria ===
                    category;


                let periodMatch = true;


                if (period === "today") {

                    periodMatch =
                        isToday(
                            transaction.data
                        );

                }


                if (period === "week") {

                    periodMatch =
                        isCurrentWeek(
                            transaction.data
                        );

                }


                if (period === "month") {

                    periodMatch =
                        isCurrentMonth(
                            transaction.data
                        );

                }


                if (period === "year") {

                    periodMatch =
                        isCurrentYear(
                            transaction.data
                        );

                }


                return (
                    searchMatch &&
                    typeMatch &&
                    categoryMatch &&
                    periodMatch
                );

            }
        );


    sortTransactions();


    renderTransactions();

}


/**
 * Ordena por data.
 */
function sortTransactions() {

    financeState.filteredTransactions.sort(
        (a, b) => {

            const dateA =
                parseDate(a.data)?.getTime() ||
                0;

            const dateB =
                parseDate(b.data)?.getTime() ||
                0;

            return dateB - dateA;

        }
    );

}


/**
 * Limpa filtros.
 */
function clearFinanceFilters() {

    const elements = [

        "transactionSearch",

        "transactionTypeFilter",

        "transactionCategoryFilter",

        "transactionPeriodFilter"

    ];


    elements.forEach(
        id => {

            const element =
                getElement(id);

            if (!element) {

                return;

            }

            element.value = "";

        }
    );


    financeState.currentPage =
        1;


    applyFilters();


    showToast(
        "Filtros limpos.",
        "info"
    );

}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function updateCategoryFilters() {

    const select =
        getElement(
            "transactionCategoryFilter"
        );


    if (!select) {

        return;

    }


    const currentValue =
        select.value;


    const categories =
        new Set(
            FINANCE_CONFIG.defaultCategories
        );


    financeState.transactions.forEach(
        transaction => {

            if (transaction.categoria) {

                categories.add(
                    transaction.categoria
                );

            }

        }
    );


    select.innerHTML = `
        <option value="">
            Todas as categorias
        </option>
    `;


    Array.from(categories)
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        )
        .forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                option.textContent =
                    category;

                select.appendChild(
                    option
                );

            }
        );


    select.value =
        currentValue;

}


/* =========================================================
   TABELA
   ========================================================= */

function renderTransactions() {

    const tbody =
        getElement(
            "transactionsTableBody"
        );

    const emptyState =
        getElement(
            "transactionsEmptyState"
        );


    if (!tbody) {

        return;

    }


    const total =
        financeState.filteredTransactions.length;


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                FINANCE_CONFIG.itemsPerPage
            )
        );


    if (
        financeState.currentPage >
        totalPages
    ) {

        financeState.currentPage =
            totalPages;

    }


    const start =
        (
            financeState.currentPage - 1
        ) *
        FINANCE_CONFIG.itemsPerPage;


    const end =
        start +
        FINANCE_CONFIG.itemsPerPage;


    const pageItems =
        financeState.filteredTransactions.slice(
            start,
            end
        );


    if (
        pageItems.length === 0
    ) {

        tbody.innerHTML = "";

        if (emptyState) {

            emptyState.hidden =
                false;

        }

    } else {

        if (emptyState) {

            emptyState.hidden =
                true;

        }


        tbody.innerHTML =
            pageItems
                .map(
                    renderTransactionRow
                )
                .join("");

    }


    updatePagination(
        total,
        start,
        end
    );

}


/**
 * Renderiza linha.
 */
function renderTransactionRow(
    transaction
) {

    const isRevenue =
        transaction.tipo === "receita";


    const typeClass =
        isRevenue
            ? "revenue"
            : "expense";


    const typeLabel =
        isRevenue
            ? "Receita"
            : "Despesa";


    const typeIcon =
        isRevenue
            ? "fa-arrow-trend-up"
            : "fa-arrow-trend-down";


    const sign =
        isRevenue
            ? "+"
            : "-";


    return `

        <tr>

            <td>

                <span class="transaction-date">

                    ${escapeHTML(
                        formatDateBR(
                            transaction.data
                        )
                    )}

                </span>

            </td>


            <td>

                <span class="transaction-type ${typeClass}">

                    <i class="fa-solid ${typeIcon}"></i>

                    ${typeLabel}

                </span>

            </td>


            <td>

                <span class="transaction-category">

                    ${escapeHTML(
                        transaction.categoria
                    )}

                </span>

            </td>


            <td>

                <span
                    class="transaction-description"
                    title="${escapeHTML(
                        transaction.descricao
                    )}"
                >

                    ${escapeHTML(
                        transaction.descricao
                    )}

                </span>

            </td>


            <td>

                <span class="transaction-payment">

                    ${escapeHTML(
                        transaction.formaPagamento ||
                        "-"
                    )}

                </span>

            </td>


            <td>

                <span
                    class="transaction-value ${typeClass}"
                >

                    ${sign}
                    ${formatCurrency(
                        transaction.valor
                    )}

                </span>

            </td>


            <td>

                <div class="transaction-actions">

                    <button
                        type="button"
                        class="table-action"
                        title="Editar"
                        onclick="editTransaction('${escapeHTML(
                            transaction.id
                        )}')"
                    >

                        <i class="fa-solid fa-pen"></i>

                    </button>


                    <button
                        type="button"
                        class="table-action delete"
                        title="Excluir"
                        onclick="deleteTransaction('${escapeHTML(
                            transaction.id
                        )}')"
                    >

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>

        </tr>

    `;

}


/* =========================================================
   PAGINAÇÃO
   ========================================================= */

function setupPagination() {

    getElement(
        "previousTransactionPage"
    )?.addEventListener(
        "click",
        () => {

            if (
                financeState.currentPage > 1
            ) {

                financeState.currentPage--;

                renderTransactions();

            }

        }
    );


    getElement(
        "nextTransactionPage"
    )?.addEventListener(
        "click",
        () => {

            const total =
                financeState.filteredTransactions.length;


            const totalPages =
                Math.max(
                    1,
                    Math.ceil(
                        total /
                        FINANCE_CONFIG.itemsPerPage
                    )
                );


            if (
                financeState.currentPage <
                totalPages
            ) {

                financeState.currentPage++;

                renderTransactions();

            }

        }
    );

}


/**
 * Atualiza paginação.
 */
function updatePagination(
    total,
    start,
    end
) {

    const info =
        getElement(
            "financePaginationInfo"
        );


    const currentPage =
        getElement(
            "currentTransactionPage"
        );


    const previous =
        getElement(
            "previousTransactionPage"
        );


    const next =
        getElement(
            "nextTransactionPage"
        );


    const resultCount =
        getElement(
            "transactionResultCount"
        );


    if (resultCount) {

        resultCount.textContent =
            `${total} movimentação${
                total === 1 ? "" : "ões"
            }`;

    }


    if (info) {

        if (total === 0) {

            info.textContent =
                "Mostrando 0–0 de 0 movimentações";

        } else {

            info.textContent =
                `Mostrando ${start + 1}–${Math.min(
                    end,
                    total
                )} de ${total} movimentações`;

        }

    }


    if (currentPage) {

        currentPage.textContent =
            String(
                financeState.currentPage
            );

    }


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                FINANCE_CONFIG.itemsPerPage
            )
        );


    if (previous) {

        previous.disabled =
            financeState.currentPage <= 1;

    }


    if (next) {

        next.disabled =
            financeState.currentPage >=
            totalPages;

    }

}


/* =========================================================
   INDICADORES
   ========================================================= */

function updateDashboardCards() {

    const currentTransactions =
        financeState.transactions.filter(
            transaction =>
                isCurrentMonth(
                    transaction.data
                )
        );


    const revenue =
        calculateRevenue(
            currentTransactions
        );


    const expenses =
        calculateExpenses(
            currentTransactions
        );


    const profit =
        revenue - expenses;


    const margin =
        revenue > 0
            ? (profit / revenue) * 100
            : 0;


    setText(
        "totalRevenue",
        formatCurrency(revenue)
    );


    setText(
        "totalExpenses",
        formatCurrency(expenses)
    );


    setText(
        "totalProfit",
        formatCurrency(profit)
    );


    setText(
        "profitMargin",
        `${margin.toFixed(1).replace(".", ",")}%`
    );


    updateVariationCards();

    renderCharts();

}


/**
 * Receita.
 */
function calculateRevenue(
    transactions
) {

    return transactions
        .filter(
            transaction =>
                transaction.tipo ===
                "receita"
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.valor || 0),
            0
        );

}


/**
 * Despesas.
 */
function calculateExpenses(
    transactions
) {

    return transactions
        .filter(
            transaction =>
                transaction.tipo ===
                "despesa"
        )
        .reduce(
            (total, transaction) =>
                total +
                Number(transaction.valor || 0),
            0
        );

}


/**
 * Atualiza variações.
 */
function updateVariationCards() {

    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    const previousMonthDate =
        new Date(
            currentYear,
            currentMonth - 1,
            1
        );


    const previousMonth =
        financeState.transactions.filter(
            transaction => {

                const date =
                    parseDate(
                        transaction.data
                    );

                if (!date) {

                    return false;

                }

                return (
                    date.getMonth() ===
                    previousMonthDate.getMonth() &&
                    date.getFullYear() ===
                    previousMonthDate.getFullYear()
                );

            }
        );


    const current =
        financeState.transactions.filter(
            transaction =>
                isCurrentMonth(
                    transaction.data
                )
        );


    const currentRevenue =
        calculateRevenue(
            current
        );


    const previousRevenue =
        calculateRevenue(
            previousMonth
        );


    const currentExpenses =
        calculateExpenses(
            current
        );


    const previousExpenses =
        calculateExpenses(
            previousMonth
        );


    const currentProfit =
        currentRevenue -
        currentExpenses;


    const previousProfit =
        previousRevenue -
        previousExpenses;


    updateVariation(
        "revenueVariation",
        calculatePercentageChange(
            previousRevenue,
            currentRevenue
        )
    );


    updateVariation(
        "expenseVariation",
        calculatePercentageChange(
            previousExpenses,
            currentExpenses
        ),
        true
    );


    updateVariation(
        "profitVariation",
        calculatePercentageChange(
            previousProfit,
            currentProfit
        )
    );

}


/**
 * Percentual de mudança.
 */
function calculatePercentageChange(
    previous,
    current
) {

    if (previous === 0) {

        return current === 0
            ? 0
            : 100;

    }

    return (
        (
            (current - previous) /
            Math.abs(previous)
        ) *
        100
    );

}


/**
 * Atualiza elemento de variação.
 */
function updateVariation(
    id,
    percentage,
    inverse = false
) {

    const element =
        getElement(id);


    if (!element) {

        return;

    }


    const positive =
        inverse
            ? percentage <= 0
            : percentage >= 0;


    element.className =
        `variation ${
            positive
                ? "positive"
                : "negative"
        }`;


    const icon =
        percentage >= 0
            ? "fa-arrow-up"
            : "fa-arrow-down";


    element.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        ${Math.abs(
            percentage
        ).toFixed(1).replace(".", ",")}%

    `;

}


/* =========================================================
   GRÁFICOS
   ========================================================= */

function renderCharts() {

    if (
        typeof Chart === "undefined"
    ) {

        console.warn(
            "Chart.js não foi carregado."
        );

        return;

    }


    renderFinanceChart();

    renderExpenseCategoryChart();

}


/**
 * Gráfico financeiro.
 */
function renderFinanceChart() {

    const canvas =
        getElement(
            "financeChart"
        );


    if (!canvas) {

        return;

    }


    const periodSelect =
        getElement(
            "financeChartPeriod"
        );


    const months =
        Number(
            periodSelect?.value || 12
        );


    const data =
        generateMonthlyData(
            months
        );


    if (
        financeState.financeChart
    ) {

        financeState.financeChart.destroy();

    }


    financeState.financeChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        data.labels,

                    datasets: [

                        {

                            label:
                                "Receitas",

                            data:
                                data.revenue,

                            borderWidth: 2,

                            tension: .35,

                            fill: false,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        },

                        {

                            label:
                                "Despesas",

                            data:
                                data.expenses,

                            borderWidth: 2,

                            tension: .35,

                            fill: false,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        mode: "index",

                        intersect: false

                    },

                    plugins: {

                        legend: {

                            position: "top",

                            align: "end",

                            labels: {

                                usePointStyle: true,

                                boxWidth: 7,

                                font: {

                                    family:
                                        "Inter",

                                    size: 10

                                }

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return (
                                            `${context.dataset.label}: ` +
                                            formatCurrency(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                font: {

                                    family:
                                        "Inter",

                                    size: 9

                                },

                                callback:
                                    value =>
                                        formatCompactCurrency(
                                            value
                                        )

                            },

                            grid: {

                                color:
                                    "rgba(148,163,184,.15)"

                            }

                        },

                        x: {

                            ticks: {

                                font: {

                                    family:
                                        "Inter",

                                    size: 9

                                }

                            },

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }
        );

}


/**
 * Gera dados mensais.
 */
function generateMonthlyData(
    numberOfMonths
) {

    const labels = [];

    const revenue = [];

    const expenses = [];


    const now =
        new Date();


    for (
        let index = numberOfMonths - 1;
        index >= 0;
        index--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - index,
                1
            );


        const month =
            date.toLocaleDateString(
                "pt-BR",
                {
                    month: "short"
                }
            );


        labels.push(
            month.charAt(0)
                .toUpperCase() +
            month.slice(1)
        );


        let monthRevenue = 0;

        let monthExpenses = 0;


        financeState.transactions.forEach(
            transaction => {

                const transactionDate =
                    parseDate(
                        transaction.data
                    );


                if (!transactionDate) {

                    return;

                }


                if (
                    transactionDate.getMonth() ===
                    date.getMonth() &&
                    transactionDate.getFullYear() ===
                    date.getFullYear()
                ) {

                    if (
                        transaction.tipo ===
                        "receita"
                    ) {

                        monthRevenue +=
                            Number(
                                transaction.valor
                            ) || 0;

                    } else {

                        monthExpenses +=
                            Number(
                                transaction.valor
                            ) || 0;

                    }

                }

            }
        );


        revenue.push(
            monthRevenue
        );


        expenses.push(
            monthExpenses
        );

    }


    return {

        labels,

        revenue,

        expenses

    };

}


/**
 * Gráfico de categorias.
 */
function renderExpenseCategoryChart() {

    const canvas =
        getElement(
            "expenseCategoryChart"
        );


    if (!canvas) {

        return;

    }


    const currentTransactions =
        financeState.transactions.filter(
            transaction =>
                isCurrentMonth(
                    transaction.data
                ) &&
                transaction.tipo ===
                "despesa"
        );


    const categories = {};


    currentTransactions.forEach(
        transaction => {

            const category =
                transaction.categoria ||
                "Outros";


            categories[category] =
                (
                    categories[category] ||
                    0
                ) +
                Number(
                    transaction.valor
                );

        }
    );


    let entries =
        Object.entries(
            categories
        );


    entries.sort(
        (a, b) =>
            b[1] - a[1]
    );


    if (
        entries.length === 0
    ) {

        entries = [
            [
                "Sem despesas",
                1
            ]
        ];

    }


    const labels =
        entries.map(
            item => item[0]
        );


    const values =
        entries.map(
            item => item[1]
        );


    const colors = [

        "#2563EB",

        "#22C55E",

        "#F59E0B",

        "#EF4444",

        "#8B5CF6",

        "#06B6D4",

        "#EC4899",

        "#84CC16",

        "#F97316",

        "#64748B"

    ];


    if (
        financeState.expenseChart
    ) {

        financeState.expenseChart.destroy();

    }


    financeState.expenseChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [

                        {

                            data: values,

                            backgroundColor:
                                labels.map(
                                    (_, index) =>
                                        colors[
                                            index %
                                            colors.length
                                        ]
                                ),

                            borderWidth: 2,

                            borderColor:
                                "#FFFFFF"

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "70%",

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return (
                                            ` ${formatCurrency(
                                                context.raw
                                            )}`
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );


    const total =
        entries.reduce(
            (
                sum,
                item
            ) =>
                sum +
                Number(item[1] || 0),
            0
        );


    setText(
        "expenseChartTotal",
        formatCompactCurrency(total)
    );


    renderExpenseLegend(
        entries,
        colors
    );

}


/**
 * Renderiza legenda.
 */
function renderExpenseLegend(
    entries,
    colors
) {

    const container =
        getElement(
            "expenseLegend"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        entries
            .map(
                (
                    [name, value],
                    index
                ) => {

                    const color =
                        colors[
                            index %
                            colors.length
                        ];


                    return `

                        <div class="expense-legend-item">

                            <span
                                class="expense-legend-color"
                                style="background:${color}"
                            ></span>


                            <span class="expense-legend-name">

                                ${escapeHTML(
                                    name
                                )}

                            </span>


                            <span class="expense-legend-value">

                                ${formatCurrency(
                                    value
                                )}

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/**
 * Troca período do gráfico.
 */
function setupChartPeriod() {

    getElement(
        "financeChartPeriod"
    )?.addEventListener(
        "change",
        renderFinanceChart
    );

}


/* =========================================================
   EXPORTAÇÃO
   ========================================================= */

function setupExport() {

    getElement(
        "exportFinanceButton"
    )?.addEventListener(
        "click",
        exportFinancialReport
    );


    setupChartPeriod();

}


/**
 * Exporta CSV.
 */
function exportFinancialReport() {

    const transactions =
        financeState.filteredTransactions;


    if (!transactions.length) {

        showToast(
            "Não existem movimentações para exportar.",
            "warning"
        );

        return;

    }


    const headers = [

        "Data",

        "Tipo",

        "Categoria",

        "Descrição",

        "Forma de pagamento",

        "Valor"

    ];


    const rows =
        transactions.map(
            transaction => [

                formatDateBR(
                    transaction.data
                ),

                transaction.tipo ===
                "receita"
                    ? "Receita"
                    : "Despesa",

                transaction.categoria,

                transaction.descricao,

                transaction.formaPagamento,

                transaction.valor
                    .toFixed(2)
                    .replace(".", ",")

            ]
        );


    const csvContent = [

        headers,

        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(
                                value ?? ""
                            ).replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(";")
        )
        .join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" +
                csvContent
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const date =
        new Date()
            .toISOString()
            .slice(0, 10);


    link.href =
        url;

    link.download =
        `atlas-financeiro-${date}.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Relatório exportado com sucesso.",
        "success"
    );

}


/* =========================================================
   PESQUISA GLOBAL
   ========================================================= */

function setupGlobalSearch() {

    const input =
        getElement(
            "globalSearchInput"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Enter"
            ) {

                return;

            }


            const value =
                input.value
                    .trim()
                    .toLowerCase();


            if (!value) {

                return;

            }


            const search =
                getElement(
                    "transactionSearch"
                );


            if (search) {

                search.value =
                    value;

                financeState.currentPage =
                    1;

                applyFilters();

                search.focus();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "/" &&
                document.activeElement.tagName !==
                "INPUT" &&
                document.activeElement.tagName !==
                "TEXTAREA" &&
                document.activeElement.tagName !==
                "SELECT"
            ) {

                event.preventDefault();

                input.focus();

            }

        }
    );

}


/* =========================================================
   TEMA
   ========================================================= */

function setupThemeSupport() {

    const savedTheme =
        localStorage.getItem(
            "atlas_theme"
        );


    if (savedTheme) {

        document.documentElement
            .setAttribute(
                "data-theme",
                savedTheme
            );

    }


    window.addEventListener(
        "atlasThemeChanged",
        event => {

            const theme =
                event.detail?.theme;


            if (theme) {

                document.documentElement
                    .setAttribute(
                        "data-theme",
                        theme
                    );

            }

        }
    );

}


/* =========================================================
   FORM ERROR
   ========================================================= */

function showFormError(
    message
) {

    const container =
        getElement(
            "transactionFormError"
        );


    if (!container) {

        return;

    }


    const text =
        container.querySelector(
            "span"
        );


    if (text) {

        text.textContent =
            message;

    }


    container.hidden =
        false;

}


function hideFormError() {

    const container =
        getElement(
            "transactionFormError"
        );


    if (container) {

        container.hidden =
            true;

    }

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    const toast =
        getElement(
            "financeToast"
        );


    const messageElement =
        getElement(
            "financeToastMessage"
        );


    const icon =
        getElement(
            "financeToastIcon"
        );


    if (
        !toast ||
        !messageElement
    ) {

        return;

    }


    messageElement.textContent =
        message;


    if (icon) {

        const iconMap = {

            success:
                "fa-circle-check",

            error:
                "fa-circle-xmark",

            warning:
                "fa-triangle-exclamation",

            info:
                "fa-circle-info"

        };


        icon.className =
            `fa-solid ${
                iconMap[type] ||
                iconMap.success
            }`;

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        financeState.toastTimer
    );


    financeState.toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/**
 * Fecha toast.
 */
function setupToastClose() {

    getElement(
        "closeFinanceToast"
    )?.addEventListener(
        "click",
        () => {

            getElement(
                "financeToast"
            )?.classList.remove(
                "show"
            );

        }
    );

}


/* =========================================================
   DATA PADRÃO
   ========================================================= */

function setDefaultDate() {

    const input =
        getElement(
            "transactionDate"
        );


    if (
        input &&
        !input.value
    ) {

        input.value =
            getToday();

    }

}


/* =========================================================
   HELPERS
   ========================================================= */

function setText(
    id,
    value
) {

    const element =
        getElement(id);


    if (element) {

        element.textContent =
            value;

    }

}


/**
 * Debounce.
 */
function debounce(
    callback,
    delay
) {

    let timeout;


    return function (...args) {

        clearTimeout(
            timeout
        );


        timeout =
            setTimeout(
                () =>
                    callback.apply(
                        this,
                        args
                    ),
                delay
            );

    };

}


/* =========================================================
   EVENTO DE TOAST
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    setupToastClose
);


/* =========================================================
   API PÚBLICA
   Permite que outras páginas/componentes
   atualizem o módulo financeiro.
   ========================================================= */

window.AtlasFinanceiro = {

    getTransactions: () =>
        financeState.transactions,

    addTransaction:
        async transaction => {

            const normalized =
                normalizeTransaction(
                    transaction
                );


            financeState.transactions
                .unshift(
                    normalized
                );


            await saveTransactionsToDatabase(
                financeState.transactions
            );


            updateDashboardCards();

            updateCategoryFilters();

            applyFilters();

            updateNotifications();


            return normalized;

        },


    refresh:
        async () => {

            await loadFinanceData();

            updateDashboardCards();

            updateCategoryFilters();

            applyFilters();

            updateNotifications();

        },


    formatCurrency,

    calculateRevenue,

    calculateExpenses

};


/* =========================================================
   FINAL
   ========================================================= */

console.info(
    "Atlas Gestão — módulo Financeiro carregado."
);
```
