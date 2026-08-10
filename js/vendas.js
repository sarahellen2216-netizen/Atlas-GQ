```javascript
/* =========================================================
   ATLAS GESTÃO
   MÓDULO DE VENDAS
   vendas.js
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const SALES_STORAGE_KEY = "atlas_vendas";
const PRODUCTS_STORAGE_KEY = "atlas_produtos";

const SALES_PER_PAGE = 10;

let sales = [];
let products = [];

let filteredSales = [];

let currentPage = 1;

let editingSaleId = null;
let deletingSaleId = null;

let salesChart = null;

let toastTimer = null;


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeSalesModule();

});


function initializeSalesModule() {

    loadData();

    setupEvents();

    setDefaultSaleDate();

    populateProductSelect();

    updateProductStockInfo();

    renderSales();

    updateDashboard();

    initializeChart();

    loadUserInformation();

    loadNotifications();

}


/* =========================================================
   BANCO DE DADOS
   ========================================================= */

function loadData() {

    sales = readStorage(SALES_STORAGE_KEY, []);

    products = readStorage(PRODUCTS_STORAGE_KEY, []);

    if (!Array.isArray(sales)) {

        sales = [];

    }

    if (!Array.isArray(products)) {

        products = [];

    }

}


function readStorage(key, fallback) {

    try {

        const data = localStorage.getItem(key);

        if (!data) {

            return fallback;

        }

        const parsed = JSON.parse(data);

        return parsed ?? fallback;

    } catch (error) {

        console.error(
            `Erro ao ler ${key}:`,
            error
        );

        return fallback;

    }

}


function saveSales() {

    localStorage.setItem(
        SALES_STORAGE_KEY,
        JSON.stringify(sales)
    );

}


function saveProducts() {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(products)
    );

}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {


    /* -----------------------------------------
       Nova venda
       ----------------------------------------- */

    document
        .getElementById("newSaleButton")
        ?.addEventListener(
            "click",
            () => openSaleModal()
        );


    document
        .getElementById("emptyNewSaleButton")
        ?.addEventListener(
            "click",
            () => openSaleModal()
        );


    /* -----------------------------------------
       Fechar modal
       ----------------------------------------- */

    document
        .getElementById("closeSaleModal")
        ?.addEventListener(
            "click",
            closeSaleModal
        );


    document
        .getElementById("cancelSale")
        ?.addEventListener(
            "click",
            closeSaleModal
        );


    /* -----------------------------------------
       Formulário
       ----------------------------------------- */

    document
        .getElementById("saleForm")
        ?.addEventListener(
            "submit",
            handleSaleSubmit
        );


    /* -----------------------------------------
       Produto
       ----------------------------------------- */

    document
        .getElementById("saleProduct")
        ?.addEventListener(
            "change",
            handleProductChange
        );


    /* -----------------------------------------
       Quantidade
       ----------------------------------------- */

    document
        .getElementById("saleQuantity")
        ?.addEventListener(
            "input",
            updateSaleTotal
        );


    document
        .getElementById("saleUnitPrice")
        ?.addEventListener(
            "input",
            updateSaleTotal
        );


    /* -----------------------------------------
       Pesquisa
       ----------------------------------------- */

    document
        .getElementById("salesSearch")
        ?.addEventListener(
            "input",
            () => {

                currentPage = 1;

                renderSales();

            }
        );


    /* -----------------------------------------
       Filtros
       ----------------------------------------- */

    document
        .getElementById("salesPaymentFilter")
        ?.addEventListener(
            "change",
            () => {

                currentPage = 1;

                renderSales();

            }
        );


    document
        .getElementById("salesPeriodFilter")
        ?.addEventListener(
            "change",
            () => {

                currentPage = 1;

                renderSales();

            }
        );


    document
        .getElementById("clearSalesFilters")
        ?.addEventListener(
            "click",
            clearFilters
        );


    /* -----------------------------------------
       Paginação
       ----------------------------------------- */

    document
        .getElementById("previousSalePage")
        ?.addEventListener(
            "click",
            () => {

                if (currentPage > 1) {

                    currentPage--;

                    renderSales();

                }

            }
        );


    document
        .getElementById("nextSalePage")
        ?.addEventListener(
            "click",
            () => {

                const totalPages =
                    Math.ceil(
                        filteredSales.length /
                        SALES_PER_PAGE
                    );

                if (currentPage < totalPages) {

                    currentPage++;

                    renderSales();

                }

            }
        );


    /* -----------------------------------------
       Gráfico
       ----------------------------------------- */

    document
        .getElementById("salesChartPeriod")
        ?.addEventListener(
            "change",
            initializeChart
        );


    /* -----------------------------------------
       Exportação
       ----------------------------------------- */

    document
        .getElementById("exportSalesButton")
        ?.addEventListener(
            "click",
            exportSales
        );


    /* -----------------------------------------
       Exclusão
       ----------------------------------------- */

    document
        .getElementById("cancelDeleteSale")
        ?.addEventListener(
            "click",
            closeDeleteModal
        );


    document
        .getElementById("confirmDeleteSale")
        ?.addEventListener(
            "click",
            confirmDeleteSale
        );


    /* -----------------------------------------
       Toast
       ----------------------------------------- */

    document
        .getElementById("closeSalesToast")
        ?.addEventListener(
            "click",
            hideToast
        );


    /* -----------------------------------------
       Notificações
       ----------------------------------------- */

    document
        .getElementById("notificationButton")
        ?.addEventListener(
            "click",
            toggleNotifications
        );


    document
        .getElementById("markNotificationsRead")
        ?.addEventListener(
            "click",
            markNotificationsRead
        );


    /* -----------------------------------------
       Perfil
       ----------------------------------------- */

    document
        .getElementById("profileButtonTop")
        ?.addEventListener(
            "click",
            toggleProfileMenu
        );


    /* -----------------------------------------
       Logout
       ----------------------------------------- */

    document
        .getElementById("logoutButton")
        ?.addEventListener(
            "click",
            handleLogout
        );


    /* -----------------------------------------
       Menu mobile
       ----------------------------------------- */

    document
        .getElementById("sidebarToggle")
        ?.addEventListener(
            "click",
            openSidebar
        );


    document
        .getElementById("sidebarClose")
        ?.addEventListener(
            "click",
            closeSidebar
        );


    document
        .getElementById("sidebarOverlay")
        ?.addEventListener(
            "click",
            closeSidebar
        );


    /* -----------------------------------------
       Pesquisa global
       ----------------------------------------- */

    document
        .getElementById("globalSearchInput")
        ?.addEventListener(
            "input",
            handleGlobalSearch
        );


    /* -----------------------------------------
       Tecla /
       ----------------------------------------- */

    document.addEventListener(
        "keydown",
        handleKeyboardShortcuts
    );


    /* -----------------------------------------
       ESC
       ----------------------------------------- */

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeSaleModal();

                closeDeleteModal();

                closeProfileMenu();

                closeNotifications();

                closeSidebar();

            }

        }
    );

}


/* =========================================================
   DATA
   ========================================================= */

function setDefaultSaleDate() {

    const input =
        document.getElementById("saleDate");

    if (!input) {

        return;

    }

    const today =
        new Date();

    input.value =
        formatDateInput(today);

}


function formatDateInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   PRODUTOS
   ========================================================= */

function populateProductSelect() {

    const select =
        document.getElementById(
            "saleProduct"
        );

    if (!select) {

        return;

    }

    const currentValue =
        select.value;

    select.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;


    products.forEach(product => {

        const option =
            document.createElement("option");

        const productId =
            product.id ??
            product.codigo ??
            product.code;

        const productName =
            product.nome ??
            product.name ??
            "Produto sem nome";

        const price =
            Number(
                product.preco ??
                product.price ??
                0
            );


        option.value =
            productId;

        option.textContent =
            `${productName} — ${formatCurrency(price)}`;

        option.dataset.price =
            price;


        select.appendChild(option);

    });


    if (currentValue) {

        select.value =
            currentValue;

    }

}


function findProductById(id) {

    return products.find(product => {

        const productId =
            String(
                product.id ??
                product.codigo ??
                product.code ??
                ""
            );

        return productId === String(id);

    });

}


function handleProductChange() {

    const select =
        document.getElementById(
            "saleProduct"
        );

    const selectedOption =
        select?.options[
            select.selectedIndex
        ];


    if (!selectedOption) {

        return;

    }


    const price =
        Number(
            selectedOption.dataset.price
            || 0
        );


    const priceInput =
        document.getElementById(
            "saleUnitPrice"
        );


    if (
        priceInput &&
        !editingSaleId
    ) {

        priceInput.value =
            price.toFixed(2);

    }


    updateProductStockInfo();

    updateSaleTotal();

}


function updateProductStockInfo() {

    const select =
        document.getElementById(
            "saleProduct"
        );

    const info =
        document.getElementById(
            "productStockInfo"
        );


    if (!select || !info) {

        return;

    }


    const product =
        findProductById(
            select.value
        );


    if (!product) {

        info.textContent = "";

        return;

    }


    const stock =
        Number(
            product.estoque ??
            product.stock ??
            0
        );


    info.textContent =
        `Estoque disponível: ${stock} unidade(s)`;

}


/* =========================================================
   MODAL NOVA VENDA
   ========================================================= */

function openSaleModal(sale = null) {

    const modal =
        document.getElementById(
            "saleModal"
        );

    const form =
        document.getElementById(
            "saleForm"
        );


    if (!modal || !form) {

        return;

    }


    clearSaleFormError();


    editingSaleId =
        sale
            ? String(sale.id)
            : null;


    if (sale) {

        document.getElementById(
            "saleModalTitle"
        ).textContent =
            "Editar venda";


        document.getElementById(
            "saleId"
        ).value =
            sale.id;


        document.getElementById(
            "saleCustomer"
        ).value =
            sale.cliente || "";


        document.getElementById(
            "saleProduct"
        ).value =
            sale.produtoId || "";


        document.getElementById(
            "saleDate"
        ).value =
            sale.data || "";


        document.getElementById(
            "saleQuantity"
        ).value =
            sale.quantidade || 1;


        document.getElementById(
            "saleUnitPrice"
        ).value =
            Number(
                sale.valorUnitario || 0
            ).toFixed(2);


        document.getElementById(
            "salePayment"
        ).value =
            sale.formaPagamento || "";


        document.getElementById(
            "saleNotes"
        ).value =
            sale.observacoes || "";


        updateProductStockInfo();

        updateSaleTotal();


    } else {

        form.reset();


        document.getElementById(
            "saleId"
        ).value = "";


        setDefaultSaleDate();


        document.getElementById(
            "saleQuantity"
        ).value = 1;


        document.getElementById(
            "saleTotal"
        ).value = "0,00";


        document.getElementById(
            "saleModalTitle"
        ).textContent =
            "Nova venda";


        updateProductStockInfo();

    }


    modal.classList.add("active");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";


    setTimeout(
        () => {

            document
                .getElementById(
                    "saleCustomer"
                )
                ?.focus();

        },
        100
    );

}


function closeSaleModal() {

    const modal =
        document.getElementById(
            "saleModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove("active");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow = "";

    editingSaleId = null;

    clearSaleFormError();

}


/* =========================================================
   TOTAL DA VENDA
   ========================================================= */

function updateSaleTotal() {

    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            )?.value || 0
        );


    const unitPrice =
        Number(
            document.getElementById(
                "saleUnitPrice"
            )?.value || 0
        );


    const total =
        quantity *
        unitPrice;


    const totalInput =
        document.getElementById(
            "saleTotal"
        );


    if (totalInput) {

        totalInput.value =
            formatNumber(total);

    }

}


/* =========================================================
   SALVAR VENDA
   ========================================================= */

function handleSaleSubmit(event) {

    event.preventDefault();


    clearSaleFormError();


    const customer =
        document.getElementById(
            "saleCustomer"
        ).value.trim();


    const productId =
        document.getElementById(
            "saleProduct"
        ).value;


    const date =
        document.getElementById(
            "saleDate"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "saleQuantity"
            ).value
        );


    const unitPrice =
        Number(
            document.getElementById(
                "saleUnitPrice"
            ).value
        );


    const payment =
        document.getElementById(
            "salePayment"
        ).value;


    const notes =
        document.getElementById(
            "saleNotes"
        ).value.trim();


    /* -----------------------------------------
       Validações
       ----------------------------------------- */

    if (!customer) {

        showSaleFormError(
            "Informe o nome do cliente."
        );

        return;

    }


    if (!productId) {

        showSaleFormError(
            "Selecione um produto."
        );

        return;

    }


    if (!date) {

        showSaleFormError(
            "Informe a data da venda."
        );

        return;

    }


    if (
        !Number.isFinite(quantity) ||
        quantity <= 0
    ) {

        showSaleFormError(
            "Informe uma quantidade válida."
        );

        return;

    }


    if (
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
    ) {

        showSaleFormError(
            "Informe um preço válido."
        );

        return;

    }


    if (!payment) {

        showSaleFormError(
            "Selecione a forma de pagamento."
        );

        return;

    }


    const product =
        findProductById(productId);


    if (!product) {

        showSaleFormError(
            "O produto selecionado não foi encontrado."
        );

        return;

    }


    /* -----------------------------------------
       Estoque
       ----------------------------------------- */

    const currentStock =
        Number(
            product.estoque ??
            product.stock ??
            0
        );


    let stockAvailable =
        currentStock;


    /*
       Ao editar uma venda, devolvemos
       temporariamente a quantidade anterior
       ao estoque para realizar a validação.
    */

    if (editingSaleId) {

        const oldSale =
            sales.find(
                item =>
                    String(item.id) ===
                    String(editingSaleId)
            );


        if (
            oldSale &&
            String(oldSale.produtoId) ===
            String(productId)
        ) {

            stockAvailable +=
                Number(
                    oldSale.quantidade || 0
                );

        }

    }


    if (quantity > stockAvailable) {

        showSaleFormError(
            `Estoque insuficiente. Disponível: ${stockAvailable} unidade(s).`
        );

        return;

    }


    /* -----------------------------------------
       Salvar
       ----------------------------------------- */

    const total =
        quantity *
        unitPrice;


    if (editingSaleId) {

        updateExistingSale({

            id: editingSaleId,

            cliente: customer,

            produtoId: productId,

            data: date,

            quantidade: quantity,

            valorUnitario: unitPrice,

            valor: total,

            formaPagamento: payment,

            observacoes: notes

        });


    } else {

        createSale({

            cliente: customer,

            produtoId: productId,

            data: date,

            quantidade: quantity,

            valorUnitario: unitPrice,

            valor: total,

            formaPagamento: payment,

            observacoes: notes

        });

    }

}


/* =========================================================
   CRIAR VENDA
   ========================================================= */

function createSale(data) {

    const product =
        findProductById(
            data.produtoId
        );


    const sale = {

        id: generateId(),

        cliente: data.cliente,

        produtoId: data.produtoId,

        produto:
            product?.nome ??
            product?.name ??
            "Produto",

        data: data.data,

        quantidade: data.quantidade,

        valorUnitario: data.valorUnitario,

        valor: data.valor,

        formaPagamento:
            data.formaPagamento,

        observacoes:
            data.observacoes,

        criadoEm:
            new Date().toISOString()

    };


    sales.unshift(sale);


    updateProductStock(
        data.produtoId,
        -data.quantidade
    );


    saveSales();

    saveProducts();


    closeSaleModal();

    renderSales();

    updateDashboard();

    initializeChart();

    loadNotifications();


    showToast(
        "Venda cadastrada com sucesso."
    );

}


/* =========================================================
   EDITAR VENDA
   ========================================================= */

function updateExistingSale(data) {

    const index =
        sales.findIndex(
            sale =>
                String(sale.id) ===
                String(data.id)
        );


    if (index === -1) {

        showToast(
            "Venda não encontrada.",
            "error"
        );

        return;

    }


    const oldSale =
        sales[index];


    /* -----------------------------------------
       Devolver estoque antigo
       ----------------------------------------- */

    updateProductStock(
        oldSale.produtoId,
        Number(
            oldSale.quantidade || 0
        )
    );


    /* -----------------------------------------
       Remover estoque da nova venda
       ----------------------------------------- */

    updateProductStock(
        data.produtoId,
        -data.quantidade
    );


    const product =
        findProductById(
            data.produtoId
        );


    sales[index] = {

        ...oldSale,

        cliente: data.cliente,

        produtoId: data.produtoId,

        produto:
            product?.nome ??
            product?.name ??
            "Produto",

        data: data.data,

        quantidade: data.quantidade,

        valorUnitario:
            data.valorUnitario,

        valor:
            data.valor,

        formaPagamento:
            data.formaPagamento,

        observacoes:
            data.observacoes,

        atualizadoEm:
            new Date().toISOString()

    };


    saveSales();

    saveProducts();


    closeSaleModal();

    renderSales();

    updateDashboard();

    initializeChart();

    loadNotifications();


    showToast(
        "Venda atualizada com sucesso."
    );

}


/* =========================================================
   ESTOQUE
   ========================================================= */

function updateProductStock(
    productId,
    difference
) {

    const product =
        findProductById(
            productId
        );


    if (!product) {

        return;

    }


    if (
        Object.prototype.hasOwnProperty.call(
            product,
            "estoque"
        )
    ) {

        product.estoque =
            Math.max(
                0,
                Number(
                    product.estoque || 0
                ) + difference
            );

    } else {

        product.stock =
            Math.max(
                0,
                Number(
                    product.stock || 0
                ) + difference
            );

    }

}


/* =========================================================
   RENDER TABELA
   ========================================================= */

function renderSales() {

    const tbody =
        document.getElementById(
            "salesTableBody"
        );


    const emptyState =
        document.getElementById(
            "salesEmptyState"
        );


    if (!tbody) {

        return;

    }


    filteredSales =
        getFilteredSales();


    const total =
        filteredSales.length;


    const start =
        (currentPage - 1) *
        SALES_PER_PAGE;


    const end =
        start +
        SALES_PER_PAGE;


    const pageSales =
        filteredSales.slice(
            start,
            end
        );


    tbody.innerHTML = "";


    if (pageSales.length === 0) {

        tbody.style.display =
            "none";

        if (emptyState) {

            emptyState.hidden =
                false;

        }

    } else {

        tbody.style.display =
            "";

        if (emptyState) {

            emptyState.hidden =
                true;

        }


        pageSales.forEach(
            sale => {

                tbody.appendChild(
                    createSaleRow(sale)
                );

            }
        );

    }


    updatePagination(
        total,
        start,
        pageSales.length
    );


    const count =
        document.getElementById(
            "salesResultCount"
        );


    if (count) {

        count.textContent =
            `${total} ${
                total === 1
                    ? "venda"
                    : "vendas"
            }`;

    }

}


/* =========================================================
   CRIAR LINHA
   ========================================================= */

function createSaleRow(sale) {

    const row =
        document.createElement("tr");


    const customerInitial =
        getInitials(
            sale.cliente
        );


    const paymentClass =
        getPaymentClass(
            sale.formaPagamento
        );


    const productName =
        sale.produto ||
        getProductName(
            sale.produtoId
        );


    row.innerHTML = `

        <td>
            ${formatDate(sale.data)}
        </td>


        <td>

            <div class="table-customer">

                <div class="customer-avatar">
                    ${escapeHtml(customerInitial)}
                </div>

                <span class="customer-name">
                    ${escapeHtml(sale.cliente)}
                </span>

            </div>

        </td>


        <td>

            <div class="table-product">

                <div class="product-table-icon">

                    <i class="fa-solid fa-box"></i>

                </div>

                <span class="product-table-name"
                    title="${escapeHtml(productName)}"
                >
                    ${escapeHtml(productName)}
                </span>

            </div>

        </td>


        <td>
            ${formatNumber(
                sale.quantidade
            )}
        </td>


        <td>

            <span class="payment-badge ${paymentClass}">

                ${getPaymentIcon(
                    sale.formaPagamento
                )}

                ${escapeHtml(
                    sale.formaPagamento
                )}

            </span>

        </td>


        <td>

            <span class="sale-value">

                ${formatCurrency(
                    sale.valor
                )}

            </span>

        </td>


        <td>

            <div class="table-actions">


                <button
                    type="button"
                    class="table-action-button"
                    title="Editar venda"
                    data-action="edit"
                    data-id="${sale.id}"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="table-action-button delete"
                    title="Excluir venda"
                    data-action="delete"
                    data-id="${sale.id}"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>


            </div>

        </td>

    `;


    row
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        button.dataset.id;

                    const action =
                        button.dataset.action;


                    if (action === "edit") {

                        editSale(id);

                    }


                    if (action === "delete") {

                        openDeleteModal(id);

                    }

                }
            );

        });


    return row;

}


/* =========================================================
   FILTROS
   ========================================================= */

function getFilteredSales() {

    const search =
        document
            .getElementById(
                "salesSearch"
            )
            ?.value
            .trim()
            .toLowerCase()
            || "";


    const payment =
        document
            .getElementById(
                "salesPaymentFilter"
            )
            ?.value
            || "";


    const period =
        document
            .getElementById(
                "salesPeriodFilter"
            )
            ?.value
            || "";


    return sales.filter(
        sale => {


            /* Pesquisa */

            if (search) {

                const productName =
                    sale.produto ||
                    getProductName(
                        sale.produtoId
                    );


                const searchableText = [

                    sale.cliente,

                    productName,

                    sale.formaPagamento,

                    sale.observacoes

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                if (
                    !searchableText.includes(
                        search
                    )
                ) {

                    return false;

                }

            }


            /* Pagamento */

            if (
                payment &&
                sale.formaPagamento !== payment
            ) {

                return false;

            }


            /* Período */

            if (
                period &&
                !isSaleInPeriod(
                    sale.data,
                    period
                )
            ) {

                return false;

            }


            return true;

        }
    );

}


function isSaleInPeriod(
    saleDate,
    period
) {

    const date =
        parseLocalDate(
            saleDate
        );


    if (!date) {

        return false;

    }


    const now =
        new Date();


    switch (period) {


        case "today":

            return (
                date.toDateString() ===
                now.toDateString()
            );


        case "week": {

            const firstDay =
                new Date(now);

            const day =
                now.getDay();

            const diff =
                day === 0
                    ? 6
                    : day - 1;


            firstDay.setDate(
                now.getDate() - diff
            );

            firstDay.setHours(
                0,
                0,
                0,
                0
            );


            return date >= firstDay;

        }


        case "month":

            return (
                date.getMonth() ===
                    now.getMonth()
                &&
                date.getFullYear() ===
                    now.getFullYear()
            );


        case "year":

            return (
                date.getFullYear() ===
                now.getFullYear()
            );


        default:

            return true;

    }

}


function clearFilters() {

    const search =
        document.getElementById(
            "salesSearch"
        );


    const payment =
        document.getElementById(
            "salesPaymentFilter"
        );


    const period =
        document.getElementById(
            "salesPeriodFilter"
        );


    if (search) {

        search.value = "";

    }


    if (payment) {

        payment.value = "";

    }


    if (period) {

        period.value = "";

    }


    currentPage = 1;

    renderSales();

}


/* =========================================================
   PAGINAÇÃO
   ========================================================= */

function updatePagination(
    total,
    start,
    visible
) {

    const info =
        document.getElementById(
            "salesPaginationInfo"
        );


    const current =
        document.getElementById(
            "currentSalePage"
        );


    const previous =
        document.getElementById(
            "previousSalePage"
        );


    const next =
        document.getElementById(
            "nextSalePage"
        );


    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                SALES_PER_PAGE
            )
        );


    if (currentPage > totalPages) {

        currentPage =
            totalPages;

    }


    if (info) {

        const first =
            total === 0
                ? 0
                : start + 1;

        const last =
            start + visible;


        info.textContent =
            `Mostrando ${first}–${last} de ${total} ${
                total === 1
                    ? "venda"
                    : "vendas"
            }`;

    }


    if (current) {

        current.textContent =
            currentPage;

    }


    if (previous) {

        previous.disabled =
            currentPage <= 1;

    }


    if (next) {

        next.disabled =
            currentPage >= totalPages;

    }

}


/* =========================================================
   EDITAR
   ========================================================= */

function editSale(id) {

    const sale =
        sales.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!sale) {

        showToast(
            "Venda não encontrada.",
            "error"
        );

        return;

    }


    openSaleModal(sale);

}


/* =========================================================
   EXCLUSÃO
   ========================================================= */

function openDeleteModal(id) {

    const sale =
        sales.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!sale) {

        return;

    }


    deletingSaleId =
        String(id);


    const description =
        document.getElementById(
            "deleteSaleDescription"
        );


    if (description) {

        description.textContent =
            `${sale.cliente} — ${formatCurrency(sale.valor)}`;

    }


    const modal =
        document.getElementById(
            "deleteSaleModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.add(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


function closeDeleteModal() {

    const modal =
        document.getElementById(
            "deleteSaleModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    deletingSaleId = null;


    if (
        !document
            .getElementById(
                "saleModal"
            )
            ?.classList.contains(
                "active"
            )
    ) {

        document.body.style.overflow =
            "";

    }

}


function confirmDeleteSale() {

    if (!deletingSaleId) {

        return;

    }


    const index =
        sales.findIndex(
            sale =>
                String(sale.id) ===
                String(deletingSaleId)
        );


    if (index === -1) {

        closeDeleteModal();

        return;

    }


    const sale =
        sales[index];


    /* Devolve o estoque */

    updateProductStock(
        sale.produtoId,
        Number(
            sale.quantidade || 0
        )
    );


    sales.splice(
        index,
        1
    );


    saveSales();

    saveProducts();


    closeDeleteModal();

    renderSales();

    updateDashboard();

    initializeChart();

    loadNotifications();


    showToast(
        "Venda excluída com sucesso."
    );

}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const monthly =
        getMonthlySales();


    const count =
        monthly.length;


    const revenue =
        monthly.reduce(
            (total, sale) =>
                total +
                Number(
                    sale.valor || 0
                ),
            0
        );


    const ticket =
        count > 0
            ? revenue / count
            : 0;


    const customers =
        new Set(
            monthly.map(
                sale =>
                    String(
                        sale.cliente
                    ).trim().toLowerCase()
            )
        ).size;


    setText(
        "monthlySalesCount",
        formatNumber(count)
    );


    setText(
        "monthlySalesRevenue",
        formatCurrency(revenue)
    );


    setText(
        "averageTicket",
        formatCurrency(ticket)
    );


    setText(
        "monthlyCustomers",
        formatNumber(customers)
    );


    updateTopProducts(
        monthly
    );


    updateSalesVariations();

}


/* =========================================================
   VENDAS DO MÊS
   ========================================================= */

function getMonthlySales() {

    const now =
        new Date();


    return sales.filter(
        sale => {

            const date =
                parseLocalDate(
                    sale.data
                );


            if (!date) {

                return false;

            }


            return (
                date.getMonth() ===
                    now.getMonth()
                &&
                date.getFullYear() ===
                    now.getFullYear()
            );

        }
    );

}


/* =========================================================
   VARIAÇÃO
   ========================================================= */

function updateSalesVariations() {

    const now =
        new Date();


    const currentMonth =
        getMonthSalesOffset(
            0
        );


    const previousMonth =
        getMonthSalesOffset(
            -1
        );


    const currentRevenue =
        currentMonth.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.valor || 0
                ),
            0
        );


    const previousRevenue =
        previousMonth.reduce(
            (sum, sale) =>
                sum +
                Number(
                    sale.valor || 0
                ),
            0
        );


    const salesVariation =
        calculateVariation(
            currentMonth.length,
            previousMonth.length
        );


    const revenueVariation =
        calculateVariation(
            currentRevenue,
            previousRevenue
        );


    updateVariation(
        "monthlySalesVariation",
        salesVariation
    );


    updateVariation(
        "monthlyRevenueVariation",
        revenueVariation
    );

}


function getMonthSalesOffset(
    offset
) {

    const date =
        new Date();


    date.setMonth(
        date.getMonth() +
        offset
    );


    const month =
        date.getMonth();


    const year =
        date.getFullYear();


    return sales.filter(
        sale => {

            const saleDate =
                parseLocalDate(
                    sale.data
                );


            return (
                saleDate &&
                saleDate.getMonth() ===
                    month
                &&
                saleDate.getFullYear() ===
                    year
            );

        }
    );

}


function calculateVariation(
    current,
    previous
) {

    if (previous === 0) {

        return current > 0
            ? 100
            : 0;

    }


    return (
        (current - previous) /
        previous
    ) *
    100;

}


function updateVariation(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    const rounded =
        Math.abs(value)
            .toFixed(1);


    const positive =
        value >= 0;


    element.classList.toggle(
        "positive",
        positive
    );


    element.classList.toggle(
        "negative",
        !positive
    );


    element.innerHTML = `

        <i class="fa-solid ${
            positive
                ? "fa-arrow-up"
                : "fa-arrow-down"
        }"></i>

        ${rounded}%

    `;

}


/* =========================================================
   TOP PRODUTOS
   ========================================================= */

function updateTopProducts(
    monthSales
) {

    const container =
        document.getElementById(
            "topProductsList"
        );


    if (!container) {

        return;

    }


    const ranking =
        {};


    monthSales.forEach(
        sale => {

            const id =
                sale.produtoId ||
                sale.produto;


            if (!id) {

                return;

            }


            if (!ranking[id]) {

                ranking[id] = {

                    name:
                        sale.produto ||
                        getProductName(
                            sale.produtoId
                        ),

                    quantity: 0,

                    revenue: 0

                };

            }


            ranking[id].quantity +=
                Number(
                    sale.quantidade || 0
                );


            ranking[id].revenue +=
                Number(
                    sale.valor || 0
                );

        }
    );


    const topProducts =
        Object.values(
            ranking
        )
        .sort(
            (a, b) =>
                b.quantity -
                a.quantity
        )
        .slice(0, 5);


    if (topProducts.length === 0) {

        container.innerHTML = `

            <div class="empty-mini-state">

                <i class="fa-solid fa-box-open"></i>

                <span>
                    Nenhuma venda registrada
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        topProducts
            .map(
                (product, index) => `

                    <div class="top-product-item">

                        <div class="top-product-position">
                            ${index + 1}
                        </div>


                        <div class="top-product-info">

                            <span
                                class="top-product-name"
                                title="${escapeHtml(product.name)}"
                            >
                                ${escapeHtml(product.name)}
                            </span>

                            <span class="top-product-quantity">
                                ${formatNumber(product.quantity)}
                                unidade(s)
                            </span>

                        </div>


                        <strong class="top-product-value">

                            ${formatCurrency(
                                product.revenue
                            )}

                        </strong>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   GRÁFICO
   ========================================================= */

function initializeChart() {

    const canvas =
        document.getElementById(
            "salesChart"
        );


    if (!canvas) {

        return;

    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        console.warn(
            "Chart.js não foi carregado."
        );

        return;

    }


    const period =
        Number(
            document.getElementById(
                "salesChartPeriod"
            )?.value || 30
        );


    const data =
        generateChartData(
            period
        );


    if (salesChart) {

        salesChart.destroy();

    }


    const context =
        canvas.getContext(
            "2d"
        );


    salesChart =
        new Chart(
            context,
            {

                type: "line",

                data: {

                    labels:
                        data.labels,

                    datasets: [

                        {

                            label:
                                "Faturamento",

                            data:
                                data.values,

                            borderColor:
                                "#2563EB",

                            backgroundColor:
                                "rgba(37, 99, 235, 0.10)",

                            borderWidth: 2,

                            fill: true,

                            tension: 0.35,

                            pointRadius: 3,

                            pointHoverRadius: 5

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    interaction: {

                        intersect: false,

                        mode: "index"

                    },

                    plugins: {

                        legend: {

                            display: false

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context => {

                                        return (
                                            " " +
                                            formatCurrency(
                                                context.parsed.y
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

                                callback:
                                    value =>
                                        formatCurrencyCompact(
                                            value
                                        )

                            },

                            grid: {

                                color:
                                    "rgba(148, 163, 184, 0.15)"

                            }

                        },

                        x: {

                            grid: {

                                display: false

                            }

                        }

                    }

                }

            }

        );

}


function generateChartData(
    period
) {

    const labels = [];

    const values = [];


    const today =
        new Date();


    for (
        let i = period - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(today);


        date.setDate(
            today.getDate() - i
        );


        const dateString =
            formatDateInput(
                date
            );


        const daySales =
            sales.filter(
                sale =>
                    sale.data ===
                    dateString
            );


        const total =
            daySales.reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.valor || 0
                    ),
                0
            );


        if (
            period > 60
        ) {

            labels.push(
                `${String(
                    date.getDate()
                ).padStart(2, "0")}/${
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0")
                }`
            );

        } else {

            labels.push(
                `${String(
                    date.getDate()
                ).padStart(2, "0")}/${
                    String(
                        date.getMonth() + 1
                    ).padStart(2, "0")
                }`
            );

        }


        values.push(
            total
        );

    }


    return {

        labels,

        values

    };

}


/* =========================================================
   EXPORTAÇÃO CSV
   ========================================================= */

function exportSales() {

    const data =
        getFilteredSales();


    if (data.length === 0) {

        showToast(
            "Não há vendas para exportar.",
            "error"
        );

        return;

    }


    const headers = [

        "Data",

        "Cliente",

        "Produto",

        "Quantidade",

        "Preço Unitário",

        "Valor Total",

        "Forma de Pagamento",

        "Observações"

    ];


    const rows =
        data.map(
            sale => [

                sale.data,

                sale.cliente,

                sale.produto ||
                    getProductName(
                        sale.produtoId
                    ),

                sale.quantidade,

                Number(
                    sale.valorUnitario || 0
                ).toFixed(2),

                Number(
                    sale.valor || 0
                ).toFixed(2),

                sale.formaPagamento,

                sale.observacoes || ""

            ]
        );


    const csv = [

        headers,

        ...rows

    ]
        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(value)
                                .replace(
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
                csv
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


    link.href =
        url;


    link.download =
        `atlas-vendas-${
            formatDateInput(
                new Date()
            )
        }.csv`;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Relatório exportado com sucesso."
    );

}


/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

function loadNotifications() {

    const list =
        document.getElementById(
            "notificationList"
        );


    const badge =
        document.getElementById(
            "notificationCount"
        );


    const subtitle =
        document.getElementById(
            "notificationSubtitle"
        );


    if (!list) {

        return;

    }


    const notifications =
        generateNotifications();


    if (badge) {

        badge.textContent =
            notifications.length;

        badge.style.display =
            notifications.length
                ? ""
                : "none";

    }


    if (subtitle) {

        subtitle.textContent =
            `${notifications.length} ${
                notifications.length === 1
                    ? "pendente"
                    : "pendentes"
            }`;

    }


    if (notifications.length === 0) {

        list.innerHTML = `

            <div class="empty-mini-state">

                <i class="fa-regular fa-bell"></i>

                <span>
                    Nenhuma notificação pendente.
                </span>

            </div>

        `;

        return;

    }


    list.innerHTML =
        notifications
            .map(
                notification => `

                    <div class="notification-item">

                        <div class="notification-item-icon">

                            <i class="${notification.icon}"></i>

                        </div>


                        <div>

                            <strong>
                                ${escapeHtml(
                                    notification.title
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    notification.message
                                )}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");

}


function generateNotifications() {

    const notifications = [];


    products.forEach(
        product => {

            const stock =
                Number(
                    product.estoque ??
                    product.stock ??
                    0
                );


            const minimum =
                Number(
                    product.estoqueMinimo ??
                    product.minimumStock ??
                    5
                );


            if (
                stock <= minimum
            ) {

                notifications.push({

                    icon:
                        "fa-solid fa-box",

                    title:
                        "Estoque baixo",

                    message:
                        `${product.nome ?? product.name ?? "Produto"} possui apenas ${stock} unidade(s).`

                });

            }

        }
    );


    return notifications;

}


function toggleNotifications() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (!panel) {

        return;

    }


    panel.classList.toggle(
        "active"
    );

}


function closeNotifications() {

    document
        .getElementById(
            "notificationPanel"
        )
        ?.classList.remove(
            "active"
        );

}


function markNotificationsRead() {

    closeNotifications();

    showToast(
        "Notificações marcadas como lidas."
    );

}


/* =========================================================
   PERFIL
   ========================================================= */

function loadUserInformation() {

    const user =
        readStorage(
            "atlas_usuario",
            null
        );


    if (!user) {

        return;

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


    const initials =
        getInitials(name);


    setText(
        "sidebarUserName",
        name
    );


    setText(
        "sidebarUserRole",
        role
    );


    setText(
        "topbarUserName",
        name
    );


    setText(
        "topbarUserRole",
        role
    );


    setText(
        "profileMenuName",
        name
    );


    setText(
        "profileMenuEmail",
        email
    );


    setText(
        "sidebarUserAvatar",
        initials
    );


    setText(
        "topbarAvatar",
        initials
    );


    setText(
        "profileMenuAvatar",
        initials
    );

}


function toggleProfileMenu() {

    const menu =
        document.getElementById(
            "profileMenu"
        );


    if (!menu) {

        return;

    }


    menu.classList.toggle(
        "active"
    );

}


function closeProfileMenu() {

    document
        .getElementById(
            "profileMenu"
        )
        ?.classList.remove(
            "active"
        );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function handleLogout() {

    const confirmed =
        window.confirm(
            "Deseja realmente sair do Atlas Gestão?"
        );


    if (!confirmed) {

        return;

    }


    localStorage.removeItem(
        "atlas_usuario_logado"
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        ?.classList.add(
            "active"
        );


    document
        .getElementById(
            "sidebarOverlay"
        )
        ?.classList.add(
            "active"
        );

}


function closeSidebar() {

    document
        .getElementById(
            "sidebar"
        )
        ?.classList.remove(
            "active"
        );


    document
        .getElementById(
            "sidebarOverlay"
        )
        ?.classList.remove(
            "active"
        );

}


/* =========================================================
   PESQUISA GLOBAL
   ========================================================= */

function handleGlobalSearch(event) {

    const value =
        event.target.value.trim();


    if (!value) {

        return;

    }


    const localSearch =
        document.getElementById(
            "salesSearch"
        );


    if (localSearch) {

        localSearch.value =
            value;

        currentPage = 1;

        renderSales();

    }

}


/* =========================================================
   ATALHOS
   ========================================================= */

function handleKeyboardShortcuts(
    event
) {

    if (
        event.key === "/" &&
        !isTypingInField(event.target)
    ) {

        event.preventDefault();


        document
            .getElementById(
                "globalSearchInput"
            )
            ?.focus();

    }

}


function isTypingInField(
    element
) {

    if (!element) {

        return false;

    }


    const tag =
        element.tagName;


    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT"
    );

}


/* =========================================================
   FORM ERROR
   ========================================================= */

function showSaleFormError(
    message
) {

    const container =
        document.getElementById(
            "saleFormError"
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


function clearSaleFormError() {

    const container =
        document.getElementById(
            "saleFormError"
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
        document.getElementById(
            "salesToast"
        );


    const text =
        document.getElementById(
            "salesToastMessage"
        );


    const icon =
        document.getElementById(
            "salesToastIcon"
        );


    if (!toast || !text) {

        return;

    }


    text.textContent =
        message;


    if (icon) {

        if (type === "error") {

            icon.className =
                "fa-solid fa-circle-exclamation";

            icon.parentElement.style.color =
                "#EF4444";

            icon.parentElement.style.background =
                "#FEF2F2";

        } else {

            icon.className =
                "fa-solid fa-circle-check";

            icon.parentElement.style.color =
                "#22C55E";

            icon.parentElement.style.background =
                "#F0FDF4";

        }

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            hideToast,
            3500
        );

}


function hideToast() {

    document
        .getElementById(
            "salesToast"
        )
        ?.classList.remove(
            "show"
        );

}


/* =========================================================
   HELPERS
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function getProductName(
    productId
) {

    const product =
        findProductById(
            productId
        );


    return (
        product?.nome ??
        product?.name ??
        "Produto não encontrado"
    );

}


function getInitials(
    name
) {

    if (!name) {

        return "A";

    }


    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();

}


function getPaymentClass(
    payment
) {

    const value =
        String(
            payment || ""
        ).toLowerCase();


    if (
        value.includes("pix")
    ) {

        return "pix";

    }


    if (
        value.includes("crédito")
        ||
        value.includes("credito")
    ) {

        return "credit";

    }


    if (
        value.includes("débito")
        ||
        value.includes("debito")
    ) {

        return "debit";

    }


    if (
        value.includes("dinheiro")
    ) {

        return "money";

    }


    return "";

}


function getPaymentIcon(
    payment
) {

    const value =
        String(
            payment || ""
        ).toLowerCase();


    if (
        value.includes("pix")
    ) {

        return `
            <i class="fa-brands fa-pix"></i>
        `;

    }


    if (
        value.includes("cartão")
        ||
        value.includes("cartao")
    ) {

        return `
            <i class="fa-solid fa-credit-card"></i>
        `;

    }


    if (
        value.includes("dinheiro")
    ) {

        return `
            <i class="fa-solid fa-money-bill"></i>
        `;

    }


    if (
        value.includes("boleto")
    ) {

        return `
            <i class="fa-solid fa-barcode"></i>
        `;

    }


    return `
        <i class="fa-solid fa-wallet"></i>
    `;

}


function parseLocalDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {

        const [
            year,
            month,
            day
        ] =
            value
                .split("-")
                .map(Number);


        return new Date(
            year,
            month - 1,
            day
        );

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


function formatDate(
    value
) {

    const date =
        parseLocalDate(value);


    if (!date) {

        return "-";

    }


    return date.toLocaleDateString(
        "pt-BR"
    );

}


function formatCurrency(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


function formatCurrencyCompact(
    value
) {

    const number =
        Number(value || 0);


    if (
        Math.abs(number) >=
        1000000
    ) {

        return (
            "R$ " +
            (
                number /
                1000000
            )
                .toFixed(1) +
            " mi"
        );

    }


    if (
        Math.abs(number) >=
        1000
    ) {

        return (
            "R$ " +
            (
                number /
                1000
            )
                .toFixed(1) +
            " mil"
        );

    }


    return formatCurrency(
        number
    );

}


function formatNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "pt-BR"
    );

}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   FINAL
   ========================================================= */

console.info(
    "Atlas Gestão — módulo de vendas carregado."
);
```
