```javascript
/* =========================================================
   ATLAS GESTÃO
   PRODUTOS - JAVASCRIPT
   ========================================================= */

"use strict";


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const PRODUCTS_CONFIG = {

    pageSize: 8,

    lowStockDefault: 5,

    storageKey: "atlas_produtos"

};


/* =========================================================
   ESTADO DA APLICAÇÃO
   ========================================================= */

const productsState = {

    products: [],

    filteredProducts: [],

    currentPage: 1,

    editingId: null,

    deletingId: null,

    search: "",

    category: "",

    stock: "",

    sort: "newest"

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const elements = {};


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeElements();

    initializePage();

});


/* =========================================================
   ELEMENTOS DOM
   ========================================================= */

function initializeElements() {

    elements.sidebar =
        document.getElementById("sidebar");

    elements.sidebarToggle =
        document.getElementById("sidebarToggle");

    elements.sidebarClose =
        document.getElementById("sidebarClose");

    elements.sidebarOverlay =
        document.getElementById("sidebarOverlay");

    elements.logoutButton =
        document.getElementById("logoutButton");

    elements.profileLogout =
        document.getElementById("profileLogout");


    /* Usuário */

    elements.sidebarUserName =
        document.getElementById("sidebarUserName");

    elements.sidebarUserRole =
        document.getElementById("sidebarUserRole");

    elements.sidebarUserAvatar =
        document.getElementById("sidebarUserAvatar");

    elements.topbarUserName =
        document.getElementById("topbarUserName");

    elements.topbarUserRole =
        document.getElementById("topbarUserRole");

    elements.topbarAvatar =
        document.getElementById("topbarAvatar");

    elements.profileMenuName =
        document.getElementById("profileMenuName");

    elements.profileMenuEmail =
        document.getElementById("profileMenuEmail");

    elements.profileMenuAvatar =
        document.getElementById("profileMenuAvatar");


    /* Pesquisa */

    elements.globalSearchInput =
        document.getElementById("globalSearchInput");

    elements.productSearch =
        document.getElementById("productSearch");


    /* Filtros */

    elements.categoryFilter =
        document.getElementById("categoryFilter");

    elements.stockFilter =
        document.getElementById("stockFilter");

    elements.sortProducts =
        document.getElementById("sortProducts");

    elements.clearFilters =
        document.getElementById("clearFilters");


    /* Estatísticas */

    elements.totalProducts =
        document.getElementById("totalProducts");

    elements.totalStock =
        document.getElementById("totalStock");

    elements.lowStockProducts =
        document.getElementById("lowStockProducts");

    elements.totalCategories =
        document.getElementById("totalCategories");


    /* Alerta */

    elements.stockAlert =
        document.getElementById("stockAlert");

    elements.stockAlertMessage =
        document.getElementById("stockAlertMessage");

    elements.closeStockAlert =
        document.getElementById("closeStockAlert");


    /* Tabela */

    elements.productsTableBody =
        document.getElementById("productsTableBody");

    elements.productsEmptyState =
        document.getElementById("productsEmptyState");

    elements.productsResultCount =
        document.getElementById("productsResultCount");

    elements.paginationInfo =
        document.getElementById("paginationInfo");

    elements.previousPage =
        document.getElementById("previousPage");

    elements.nextPage =
        document.getElementById("nextPage");

    elements.currentPage =
        document.getElementById("currentPage");


    /* Modal */

    elements.productModal =
        document.getElementById("productModal");

    elements.productModalTitle =
        document.getElementById("productModalTitle");

    elements.productForm =
        document.getElementById("productForm");

    elements.productId =
        document.getElementById("productId");

    elements.productCode =
        document.getElementById("productCode");

    elements.productName =
        document.getElementById("productName");

    elements.productCategory =
        document.getElementById("productCategory");

    elements.productStock =
        document.getElementById("productStock");

    elements.productMinimumStock =
        document.getElementById("productMinimumStock");

    elements.productPrice =
        document.getElementById("productPrice");

    elements.productSupplier =
        document.getElementById("productSupplier");

    elements.productUnit =
        document.getElementById("productUnit");

    elements.productDescription =
        document.getElementById("productDescription");

    elements.productStatus =
        document.getElementById("productStatus");

    elements.productFormError =
        document.getElementById("productFormError");

    elements.saveProduct =
        document.getElementById("saveProduct");

    elements.closeProductModal =
        document.getElementById("closeProductModal");

    elements.cancelProduct =
        document.getElementById("cancelProduct");

    elements.newProductButton =
        document.getElementById("newProductButton");

    elements.emptyNewProductButton =
        document.getElementById(
            "emptyNewProductButton"
        );


    /* Exclusão */

    elements.deleteProductModal =
        document.getElementById(
            "deleteProductModal"
        );

    elements.deleteProductName =
        document.getElementById(
            "deleteProductName"
        );

    elements.cancelDeleteProduct =
        document.getElementById(
            "cancelDeleteProduct"
        );

    elements.confirmDeleteProduct =
        document.getElementById(
            "confirmDeleteProduct"
        );


    /* Toast */

    elements.productToast =
        document.getElementById(
            "productToast"
        );

    elements.productToastIcon =
        document.getElementById(
            "productToastIcon"
        );

    elements.productToastMessage =
        document.getElementById(
            "productToastMessage"
        );

    elements.closeProductToast =
        document.getElementById(
            "closeProductToast"
        );


    /* Notificações */

    elements.notificationButton =
        document.getElementById(
            "notificationButton"
        );

    elements.notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    elements.notificationList =
        document.getElementById(
            "notificationList"
        );

    elements.notificationCount =
        document.getElementById(
            "notificationCount"
        );

    elements.notificationSubtitle =
        document.getElementById(
            "notificationSubtitle"
        );

    elements.markNotificationsRead =
        document.getElementById(
            "markNotificationsRead"
        );


    /* Perfil */

    elements.profileButton =
        document.getElementById(
            "profileButton"
        );

    elements.profileMenu =
        document.getElementById(
            "profileMenu"
        );


    /* Exportação */

    elements.exportProducts =
        document.getElementById(
            "exportProducts"
        );

}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function initializePage() {

    loadProducts();

    loadUserInformation();

    bindEvents();

    populateCategories();

    applyFilters();

    updateStatistics();

    updateStockAlert();

    updateNotifications();

}


/* =========================================================
   EVENTOS
   ========================================================= */

function bindEvents() {


    /* -----------------------------
       Sidebar
       ----------------------------- */

    elements.sidebarToggle?.addEventListener(
        "click",
        openSidebar
    );


    elements.sidebarClose?.addEventListener(
        "click",
        closeSidebar
    );


    elements.sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );


    /* -----------------------------
       Logout
       ----------------------------- */

    elements.logoutButton?.addEventListener(
        "click",
        logout
    );


    elements.profileLogout?.addEventListener(
        "click",
        logout
    );


    /* -----------------------------
       Produtos
       ----------------------------- */

    elements.newProductButton?.addEventListener(
        "click",
        () => openProductModal()
    );


    elements.emptyNewProductButton?.addEventListener(
        "click",
        () => openProductModal()
    );


    elements.closeProductModal?.addEventListener(
        "click",
        closeProductModal
    );


    elements.cancelProduct?.addEventListener(
        "click",
        closeProductModal
    );


    elements.productModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.productModal
            ) {

                closeProductModal();

            }

        }
    );


    elements.productForm?.addEventListener(
        "submit",
        handleProductSubmit
    );


    /* -----------------------------
       Pesquisa
       ----------------------------- */

    elements.productSearch?.addEventListener(
        "input",
        handleSearch
    );


    elements.globalSearchInput?.addEventListener(
        "input",
        handleGlobalSearch
    );


    /* -----------------------------
       Filtros
       ----------------------------- */

    elements.categoryFilter?.addEventListener(
        "change",
        handleFilterChange
    );


    elements.stockFilter?.addEventListener(
        "change",
        handleFilterChange
    );


    elements.sortProducts?.addEventListener(
        "change",
        handleFilterChange
    );


    elements.clearFilters?.addEventListener(
        "click",
        clearFilters
    );


    /* -----------------------------
       Paginação
       ----------------------------- */

    elements.previousPage?.addEventListener(
        "click",
        previousPage
    );


    elements.nextPage?.addEventListener(
        "click",
        nextPage
    );


    /* -----------------------------
       Estoque
       ----------------------------- */

    elements.closeStockAlert?.addEventListener(
        "click",
        () => {

            elements.stockAlert.hidden = true;

        }
    );


    /* -----------------------------
       Exclusão
       ----------------------------- */

    elements.cancelDeleteProduct?.addEventListener(
        "click",
        closeDeleteModal
    );


    elements.confirmDeleteProduct?.addEventListener(
        "click",
        confirmDeleteProduct
    );


    elements.deleteProductModal?.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                elements.deleteProductModal
            ) {

                closeDeleteModal();

            }

        }
    );


    /* -----------------------------
       Toast
       ----------------------------- */

    elements.closeProductToast?.addEventListener(
        "click",
        hideToast
    );


    /* -----------------------------
       Notificações
       ----------------------------- */

    elements.notificationButton?.addEventListener(
        "click",
        toggleNotificationPanel
    );


    elements.markNotificationsRead?.addEventListener(
        "click",
        markNotificationsRead
    );


    /* -----------------------------
       Perfil
       ----------------------------- */

    elements.profileButton?.addEventListener(
        "click",
        toggleProfileMenu
    );


    /* -----------------------------
       Exportação
       ----------------------------- */

    elements.exportProducts?.addEventListener(
        "click",
        exportProductsCSV
    );


    /* -----------------------------
       Teclado
       ----------------------------- */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /* -----------------------------
       Clique fora
       ----------------------------- */

    document.addEventListener(
        "click",
        handleOutsideClick
    );

}


/* =========================================================
   CARREGAMENTO DOS PRODUTOS
   ========================================================= */

function loadProducts() {

    let storedProducts = null;


    /*
     * Primeiro tenta utilizar funções existentes
     * no database.js.
     */

    if (
        typeof window.getProducts ===
        "function"
    ) {

        try {

            storedProducts =
                window.getProducts();

        } catch (error) {

            console.warn(
                "Não foi possível carregar produtos pelo database.js.",
                error
            );

        }

    }


    /*
     * Se o database.js não possuir uma função
     * específica, utiliza o LocalStorage.
     */

    if (
        !Array.isArray(storedProducts)
    ) {

        try {

            const raw =
                localStorage.getItem(
                    PRODUCTS_CONFIG.storageKey
                );

            storedProducts =
                raw ? JSON.parse(raw) : [];

        } catch (error) {

            console.error(
                "Erro ao carregar produtos.",
                error
            );

            storedProducts = [];

        }

    }


    productsState.products =
        storedProducts.map(
            normalizeProduct
        );

}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizeProduct(product) {

    const stock =
        Number(
            product.estoque ??
            product.stock ??
            0
        );


    const minimumStock =
        Number(
            product.estoqueMinimo ??
            product.minimumStock ??
            PRODUCTS_CONFIG.lowStockDefault
        );


    const price =
        Number(
            product.preco ??
            product.price ??
            0
        );


    return {

        id:
            product.id ||
            generateId(),

        codigo:
            product.codigo ||
            product.code ||
            "",

        nome:
            product.nome ||
            product.name ||
            "",

        categoria:
            product.categoria ||
            product.category ||
            "Sem categoria",

        estoque:
            Number.isFinite(stock)
                ? stock
                : 0,

        estoqueMinimo:
            Number.isFinite(minimumStock)
                ? minimumStock
                : PRODUCTS_CONFIG.lowStockDefault,

        preco:
            Number.isFinite(price)
                ? price
                : 0,

        fornecedor:
            product.fornecedor ||
            product.supplier ||
            "",

        unidade:
            product.unidade ||
            product.unit ||
            "un",

        descricao:
            product.descricao ||
            product.description ||
            "",

        status:
            product.status ||
            "Ativo",

        createdAt:
            product.createdAt ||
            product.dataCriacao ||
            new Date().toISOString(),

        updatedAt:
            product.updatedAt ||
            product.dataAtualizacao ||
            new Date().toISOString()

    };

}


/* =========================================================
   SALVAR PRODUTOS
   ========================================================= */

function saveProducts() {

    /*
     * Tenta utilizar o database.js.
     */

    if (
        typeof window.saveProducts ===
        "function"
    ) {

        try {

            window.saveProducts(
                productsState.products
            );

            return;

        } catch (error) {

            console.warn(
                "Falha ao utilizar saveProducts do database.js.",
                error
            );

        }

    }


    /*
     * Fallback LocalStorage.
     */

    localStorage.setItem(
        PRODUCTS_CONFIG.storageKey,
        JSON.stringify(
            productsState.products
        )
    );

}


/* =========================================================
   ABRIR MODAL
   ========================================================= */

function openProductModal(product = null) {

    clearProductFormError();


    if (product) {

        productsState.editingId =
            product.id;

        elements.productModalTitle.textContent =
            "Editar produto";

        fillProductForm(product);

    } else {

        productsState.editingId = null;

        elements.productModalTitle.textContent =
            "Novo produto";

        resetProductForm();

        elements.productCode.value =
            generateProductCode();

    }


    elements.productModal.classList.add(
        "active"
    );

    elements.productModal.setAttribute(
        "aria-hidden",
        "false"
    );


    setTimeout(() => {

        elements.productName?.focus();

    }, 100);

}


/* =========================================================
   FECHAR MODAL
   ========================================================= */

function closeProductModal() {

    elements.productModal.classList.remove(
        "active"
    );

    elements.productModal.setAttribute(
        "aria-hidden",
        "true"
    );

    productsState.editingId = null;

    clearProductFormError();

}


/* =========================================================
   RESET FORMULÁRIO
   ========================================================= */

function resetProductForm() {

    elements.productForm.reset();

    elements.productId.value = "";

    elements.productMinimumStock.value =
        PRODUCTS_CONFIG.lowStockDefault;

    elements.productUnit.value =
        "un";

    elements.productStatus.value =
        "Ativo";

}


/* =========================================================
   PREENCHER FORMULÁRIO
   ========================================================= */

function fillProductForm(product) {

    elements.productId.value =
        product.id;

    elements.productCode.value =
        product.codigo;

    elements.productName.value =
        product.nome;

    elements.productCategory.value =
        product.categoria;

    elements.productStock.value =
        product.estoque;

    elements.productMinimumStock.value =
        product.estoqueMinimo;

    elements.productPrice.value =
        product.preco;

    elements.productSupplier.value =
        product.fornecedor;

    elements.productUnit.value =
        product.unidade;

    elements.productDescription.value =
        product.descricao;

    elements.productStatus.value =
        product.status;

}


/* =========================================================
   SUBMIT
   ========================================================= */

function handleProductSubmit(event) {

    event.preventDefault();

    clearProductFormError();


    const formData =
        new FormData(
            elements.productForm
        );


    const productData = {

        codigo:
            String(
                formData.get("codigo") || ""
            ).trim(),

        nome:
            String(
                formData.get("nome") || ""
            ).trim(),

        categoria:
            String(
                formData.get("categoria") || ""
            ).trim(),

        estoque:
            Number(
                formData.get("estoque")
            ),

        estoqueMinimo:
            Number(
                formData.get("estoqueMinimo")
            ),

        preco:
            Number(
                formData.get("preco")
            ),

        fornecedor:
            String(
                formData.get("fornecedor") || ""
            ).trim(),

        unidade:
            String(
                formData.get("unidade") || "un"
            ),

        descricao:
            String(
                formData.get("descricao") || ""
            ).trim(),

        status:
            String(
                formData.get("status") || "Ativo"
            )

    };


    const validation =
        validateProduct(
            productData
        );


    if (!validation.valid) {

        showProductFormError(
            validation.message
        );

        return;

    }


    if (productsState.editingId) {

        updateProduct(
            productsState.editingId,
            productData
        );

    } else {

        createProduct(
            productData
        );

    }

}


/* =========================================================
   VALIDAÇÃO
   ========================================================= */

function validateProduct(product) {

    if (!product.codigo) {

        return {
            valid: false,
            message:
                "Informe o código do produto."
        };

    }


    if (!product.nome) {

        return {
            valid: false,
            message:
                "Informe o nome do produto."
        };

    }


    if (!product.categoria) {

        return {
            valid: false,
            message:
                "Informe a categoria do produto."
        };

    }


    if (
        !Number.isFinite(product.estoque) ||
        product.estoque < 0
    ) {

        return {
            valid: false,
            message:
                "Informe um estoque válido."
        };

    }


    if (
        !Number.isFinite(
            product.estoqueMinimo
        ) ||
        product.estoqueMinimo < 0
    ) {

        return {
            valid: false,
            message:
                "Informe um estoque mínimo válido."
        };

    }


    if (
        !Number.isFinite(product.preco) ||
        product.preco < 0
    ) {

        return {
            valid: false,
            message:
                "Informe um preço válido."
        };

    }


    const duplicatedCode =
        productsState.products.some(
            productItem => {

                return (
                    productItem.codigo
                        .toLowerCase() ===
                    product.codigo
                        .toLowerCase() &&
                    productItem.id !==
                        productsState.editingId
                );

            }
        );


    if (duplicatedCode) {

        return {
            valid: false,
            message:
                "Já existe um produto com este código."
        };

    }


    return {
        valid: true
    };

}


/* =========================================================
   CRIAR PRODUTO
   ========================================================= */

function createProduct(data) {

    const product = {

        id:
            generateId(),

        ...data,

        createdAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()

    };


    productsState.products.unshift(
        product
    );


    saveProducts();

    closeProductModal();

    populateCategories();

    applyFilters();

    updateStatistics();

    updateStockAlert();

    updateNotifications();


    showToast(
        "Produto cadastrado com sucesso.",
        "success"
    );

}


/* =========================================================
   ATUALIZAR PRODUTO
   ========================================================= */

function updateProduct(id, data) {

    const index =
        productsState.products.findIndex(
            product =>
                product.id === id
        );


    if (index === -1) {

        showToast(
            "Produto não encontrado.",
            "error"
        );

        return;

    }


    productsState.products[index] = {

        ...productsState.products[index],

        ...data,

        updatedAt:
            new Date().toISOString()

    };


    saveProducts();

    closeProductModal();

    populateCategories();

    applyFilters();

    updateStatistics();

    updateStockAlert();

    updateNotifications();


    showToast(
        "Produto atualizado com sucesso.",
        "success"
    );

}


/* =========================================================
   ABRIR EXCLUSÃO
   ========================================================= */

function openDeleteModal(id) {

    const product =
        productsState.products.find(
            item =>
                item.id === id
        );


    if (!product) {

        return;

    }


    productsState.deletingId =
        id;


    elements.deleteProductName.textContent =
        product.nome;


    elements.deleteProductModal.classList.add(
        "active"
    );

    elements.deleteProductModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


/* =========================================================
   FECHAR EXCLUSÃO
   ========================================================= */

function closeDeleteModal() {

    elements.deleteProductModal.classList.remove(
        "active"
    );

    elements.deleteProductModal.setAttribute(
        "aria-hidden",
        "true"
    );

    productsState.deletingId = null;

}


/* =========================================================
   CONFIRMAR EXCLUSÃO
   ========================================================= */

function confirmDeleteProduct() {

    const id =
        productsState.deletingId;


    if (!id) {

        return;

    }


    const index =
        productsState.products.findIndex(
            product =>
                product.id === id
        );


    if (index === -1) {

        closeDeleteModal();

        return;

    }


    const productName =
        productsState.products[index].nome;


    productsState.products.splice(
        index,
        1
    );


    saveProducts();

    closeDeleteModal();

    populateCategories();

    applyFilters();

    updateStatistics();

    updateStockAlert();

    updateNotifications();


    showToast(
        `"${productName}" foi excluído.`,
        "success"
    );

}


/* =========================================================
   RENDERIZAÇÃO
   ========================================================= */

function renderProducts() {

    const products =
        getCurrentPageProducts();


    elements.productsTableBody.innerHTML =
        "";


    if (
        productsState.filteredProducts.length ===
        0
    ) {

        elements.productsEmptyState.hidden =
            false;

        elements.productsTableBody.style.display =
            "none";

        updatePagination();

        return;

    }


    elements.productsEmptyState.hidden =
        true;

    elements.productsTableBody.style.display =
        "";


    products.forEach(
        product => {

            const row =
                createProductRow(
                    product
                );

            elements.productsTableBody.appendChild(
                row
            );

        }
    );


    updatePagination();

}


/* =========================================================
   CRIAR LINHA
   ========================================================= */

function createProductRow(product) {

    const row =
        document.createElement("tr");


    const stockStatus =
        getStockStatus(
            product
        );


    const statusClass =
        product.status === "Ativo"
            ? "active"
            : "inactive";


    row.innerHTML = `

        <td>

            <div class="product-table-name">

                <div class="product-table-image">

                    <i class="fa-solid fa-box"></i>

                </div>

                <div class="product-table-info">

                    <strong
                        title="${escapeHtml(product.nome)}"
                    >
                        ${escapeHtml(product.nome)}
                    </strong>

                    <span>
                        ${escapeHtml(
                            product.unidade || "un"
                        )}
                    </span>

                </div>

            </div>

        </td>


        <td>

            <span class="product-code">

                ${escapeHtml(
                    product.codigo
                )}

            </span>

        </td>


        <td>

            <span class="product-category">

                ${escapeHtml(
                    product.categoria
                )}

            </span>

        </td>


        <td>

            <span
                class="stock-value ${stockStatus.className}"
            >

                <span class="stock-dot"></span>

                ${formatNumber(
                    product.estoque
                )}

            </span>

        </td>


        <td>

            <span class="product-price">

                ${formatCurrency(
                    product.preco
                )}

            </span>

        </td>


        <td>

            <span
                class="product-supplier"
                title="${escapeHtml(
                    product.fornecedor || "Não informado"
                )}"
            >

                ${escapeHtml(
                    product.fornecedor ||
                    "Não informado"
                )}

            </span>

        </td>


        <td>

            <span
                class="product-status ${statusClass}"
            >

                ${escapeHtml(
                    product.status
                )}

            </span>

        </td>


        <td>

            <div class="table-actions">

                <button
                    type="button"
                    class="table-action-button edit"
                    data-action="edit"
                    data-id="${product.id}"
                    title="Editar produto"
                    aria-label="Editar produto"
                >

                    <i class="fa-solid fa-pen"></i>

                </button>


                <button
                    type="button"
                    class="table-action-button delete"
                    data-action="delete"
                    data-id="${product.id}"
                    title="Excluir produto"
                    aria-label="Excluir produto"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            </div>

        </td>

    `;


    row.querySelectorAll(
        "[data-action]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                handleTableAction
            );

        }
    );


    return row;

}


/* =========================================================
   AÇÕES DA TABELA
   ========================================================= */

function handleTableAction(event) {

    const button =
        event.currentTarget;


    const action =
        button.dataset.action;


    const id =
        button.dataset.id;


    const product =
        productsState.products.find(
            item =>
                item.id === id
        );


    if (!product) {

        return;

    }


    if (action === "edit") {

        openProductModal(
            product
        );

    }


    if (action === "delete") {

        openDeleteModal(
            id
        );

    }

}


/* =========================================================
   FILTROS
   ========================================================= */

function handleSearch(event) {

    productsState.search =
        event.target.value.trim();


    productsState.currentPage =
        1;


    applyFilters();

}


function handleGlobalSearch(event) {

    const value =
        event.target.value.trim();


    if (elements.productSearch) {

        elements.productSearch.value =
            value;

    }


    productsState.search =
        value;


    productsState.currentPage =
        1;


    applyFilters();

}


function handleFilterChange() {

    productsState.category =
        elements.categoryFilter.value;


    productsState.stock =
        elements.stockFilter.value;


    productsState.sort =
        elements.sortProducts.value;


    productsState.currentPage =
        1;


    applyFilters();

}


/* =========================================================
   APLICAR FILTROS
   ========================================================= */

function applyFilters() {

    let filtered =
        [...productsState.products];


    const search =
        productsState.search
            .toLowerCase();


    if (search) {

        filtered =
            filtered.filter(
                product => {

                    return (

                        product.nome
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.codigo
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.categoria
                            .toLowerCase()
                            .includes(search)

                        ||

                        product.fornecedor
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    if (productsState.category) {

        filtered =
            filtered.filter(
                product =>
                    product.categoria ===
                    productsState.category
            );

    }


    if (productsState.stock) {

        filtered =
            filtered.filter(
                product => {

                    const stockStatus =
                        getStockStatus(
                            product
                        ).type;


                    return (
                        stockStatus ===
                        productsState.stock
                    );

                }
            );

    }


    filtered =
        sortProducts(
            filtered,
            productsState.sort
        );


    productsState.filteredProducts =
        filtered;


    renderProducts();

    updateResultCount();

}


/* =========================================================
   ORDENAÇÃO
   ========================================================= */

function sortProducts(
    products,
    sort
) {

    return products.sort(
        (a, b) => {

            switch (sort) {

                case "name-asc":

                    return a.nome
                        .localeCompare(
                            b.nome,
                            "pt-BR"
                        );


                case "name-desc":

                    return b.nome
                        .localeCompare(
                            a.nome,
                            "pt-BR"
                        );


                case "stock-asc":

                    return (
                        a.estoque -
                        b.estoque
                    );


                case "stock-desc":

                    return (
                        b.estoque -
                        a.estoque
                    );


                case "price-asc":

                    return (
                        a.preco -
                        b.preco
                    );


                case "price-desc":

                    return (
                        b.preco -
                        a.preco
                    );


                case "newest":

                default:

                    return (
                        new Date(
                            b.createdAt
                        ) -
                        new Date(
                            a.createdAt
                        )
                    );

            }

        }
    );

}


/* =========================================================
   LIMPAR FILTROS
   ========================================================= */

function clearFilters() {

    productsState.search = "";

    productsState.category = "";

    productsState.stock = "";

    productsState.sort = "newest";

    productsState.currentPage = 1;


    if (elements.productSearch) {

        elements.productSearch.value = "";

    }


    if (elements.globalSearchInput) {

        elements.globalSearchInput.value =
            "";

    }


    if (elements.categoryFilter) {

        elements.categoryFilter.value = "";

    }


    if (elements.stockFilter) {

        elements.stockFilter.value = "";

    }


    if (elements.sortProducts) {

        elements.sortProducts.value =
            "newest";

    }


    applyFilters();

}


/* =========================================================
   PAGINAÇÃO
   ========================================================= */

function getTotalPages() {

    return Math.max(
        1,
        Math.ceil(
            productsState.filteredProducts.length /
            PRODUCTS_CONFIG.pageSize
        )
    );

}


function getCurrentPageProducts() {

    const start =
        (
            productsState.currentPage -
            1
        ) *
        PRODUCTS_CONFIG.pageSize;


    const end =
        start +
        PRODUCTS_CONFIG.pageSize;


    return productsState.filteredProducts.slice(
        start,
        end
    );

}


function previousPage() {

    if (
        productsState.currentPage >
        1
    ) {

        productsState.currentPage--;

        renderProducts();

    }

}


function nextPage() {

    const totalPages =
        getTotalPages();


    if (
        productsState.currentPage <
        totalPages
    ) {

        productsState.currentPage++;

        renderProducts();

    }

}


function updatePagination() {

    const total =
        productsState.filteredProducts.length;


    const totalPages =
        getTotalPages();


    if (
        productsState.currentPage >
        totalPages
    ) {

        productsState.currentPage =
            totalPages;

    }


    const page =
        productsState.currentPage;


    const start =
        total === 0
            ? 0
            : (
                (page - 1) *
                PRODUCTS_CONFIG.pageSize
            ) + 1;


    const end =
        Math.min(
            page *
            PRODUCTS_CONFIG.pageSize,
            total
        );


    elements.paginationInfo.textContent =
        `Mostrando ${start}–${end} de ${total} produtos`;


    elements.currentPage.textContent =
        page;


    elements.previousPage.disabled =
        page <= 1;


    elements.nextPage.disabled =
        page >= totalPages;

}


/* =========================================================
   CONTAGEM
   ========================================================= */

function updateResultCount() {

    const count =
        productsState.filteredProducts.length;


    elements.productsResultCount.textContent =
        `${count} ${
            count === 1
                ? "produto"
                : "produtos"
        }`;

}


/* =========================================================
   CATEGORIAS
   ========================================================= */

function populateCategories() {

    const categories =
        [
            ...new Set(
                productsState.products
                    .map(
                        product =>
                            product.categoria
                    )
                    .filter(Boolean)
            )
        ]
        .sort(
            (a, b) =>
                a.localeCompare(
                    b,
                    "pt-BR"
                )
        );


    const selected =
        productsState.category;


    elements.categoryFilter.innerHTML =
        `
            <option value="">
                Todas as categorias
            </option>
        `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            option.selected =
                category === selected;

            elements.categoryFilter.appendChild(
                option
            );

        }
    );


    const datalist =
        document.getElementById(
            "categoryOptions"
        );


    if (datalist) {

        datalist.innerHTML = "";


        categories.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    category;

                datalist.appendChild(
                    option
                );

            }
        );

    }

}


/* =========================================================
   ESTATÍSTICAS
   ========================================================= */

function updateStatistics() {

    const products =
        productsState.products;


    const totalProducts =
        products.length;


    const totalStock =
        products.reduce(
            (total, product) =>
                total +
                Number(product.estoque || 0),
            0
        );


    const lowStock =
        products.filter(
            product => {

                return (
                    getStockStatus(
                        product
                    ).type === "low"
                );

            }
        ).length;


    const categories =
        new Set(
            products
                .map(
                    product =>
                        product.categoria
                )
                .filter(Boolean)
        );


    elements.totalProducts.textContent =
        formatNumber(
            totalProducts
        );


    elements.totalStock.textContent =
        formatNumber(
            totalStock
        );


    elements.lowStockProducts.textContent =
        formatNumber(
            lowStock
        );


    elements.totalCategories.textContent =
        formatNumber(
            categories.size
        );

}


/* =========================================================
   STATUS DO ESTOQUE
   ========================================================= */

function getStockStatus(product) {

    const stock =
        Number(
            product.estoque || 0
        );


    const minimum =
        Number(
            product.estoqueMinimo ??
            PRODUCTS_CONFIG.lowStockDefault
        );


    if (stock <= 0) {

        return {

            type: "out",

            className: "out"

        };

    }


    if (stock <= minimum) {

        return {

            type: "low",

            className: "low"

        };

    }


    return {

        type: "normal",

        className: "normal"

    };

}


/* =========================================================
   ALERTA DE ESTOQUE
   ========================================================= */

function updateStockAlert() {

    const lowStock =
        productsState.products.filter(
            product => {

                return (
                    getStockStatus(
                        product
                    ).type === "low" ||
                    getStockStatus(
                        product
                    ).type === "out"
                );

            }
        );


    if (lowStock.length === 0) {

        elements.stockAlert.hidden =
            true;

        return;

    }


    elements.stockAlert.hidden =
        false;


    const outOfStock =
        lowStock.filter(
            product =>
                product.estoque <= 0
        ).length;


    if (outOfStock > 0) {

        elements.stockAlertMessage.textContent =
            `${outOfStock} ${
                outOfStock === 1
                    ? "produto está"
                    : "produtos estão"
            } sem estoque.`;

        return;

    }


    elements.stockAlertMessage.textContent =
        `${lowStock.length} ${
            lowStock.length === 1
                ? "produto está"
                : "produtos estão"
        } com estoque baixo.`;

}


/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

function updateNotifications() {

    const lowStock =
        productsState.products.filter(
            product => {

                return (
                    getStockStatus(
                        product
                    ).type === "low" ||
                    getStockStatus(
                        product
                    ).type === "out"
                );

            }
        );


    const count =
        lowStock.length;


    elements.notificationCount.textContent =
        count;


    elements.notificationCount.style.display =
        count > 0
            ? ""
            : "none";


    elements.notificationSubtitle.textContent =
        `${count} ${
            count === 1
                ? "pendente"
                : "pendentes"
        }`;


    renderNotifications(
        lowStock
    );

}


/* =========================================================
   RENDERIZAR NOTIFICAÇÕES
   ========================================================= */

function renderNotifications(products) {

    if (products.length === 0) {

        elements.notificationList.innerHTML = `

            <div class="notification-empty">

                <i class="fa-regular fa-bell-slash"></i>

                <p>
                    Nenhuma notificação.
                </p>

            </div>

        `;

        return;

    }


    elements.notificationList.innerHTML =
        products.map(
            product => {

                const out =
                    product.estoque <= 0;


                return `

                    <div class="notification-item">

                        <div class="notification-item-icon ${
                            out
                                ? "danger"
                                : "warning"
                        }">

                            <i class="fa-solid ${
                                out
                                    ? "fa-circle-xmark"
                                    : "fa-triangle-exclamation"
                            }"></i>

                        </div>

                        <div>

                            <strong>

                                ${
                                    out
                                        ? "Produto sem estoque"
                                        : "Estoque baixo"
                                }

                            </strong>

                            <p>

                                ${escapeHtml(
                                    product.nome
                                )}

                            </p>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


/* =========================================================
   NOTIFICAÇÕES - ABRIR
   ========================================================= */

function toggleNotificationPanel(
    event
) {

    event.stopPropagation();


    elements.profileMenu?.classList.remove(
        "active"
    );


    elements.notificationPanel.classList.toggle(
        "active"
    );

}


/* =========================================================
   MARCAR NOTIFICAÇÕES
   ========================================================= */

function markNotificationsRead() {

    showToast(
        "Notificações marcadas como lidas.",
        "success"
    );


    elements.notificationPanel.classList.remove(
        "active"
    );

}


/* =========================================================
   PERFIL
   ========================================================= */

function toggleProfileMenu(event) {

    event.stopPropagation();


    elements.notificationPanel?.classList.remove(
        "active"
    );


    elements.profileMenu.classList.toggle(
        "active"
    );

}


/* =========================================================
   CLIQUE FORA
   ========================================================= */

function handleOutsideClick(event) {

    if (
        elements.notificationPanel &&
        !elements.notificationPanel.contains(
            event.target
        ) &&
        !elements.notificationButton?.contains(
            event.target
        )
    ) {

        elements.notificationPanel.classList.remove(
            "active"
        );

    }


    if (
        elements.profileMenu &&
        !elements.profileMenu.contains(
            event.target
        ) &&
        !elements.profileButton?.contains(
            event.target
        )
    ) {

        elements.profileMenu.classList.remove(
            "active"
        );

    }

}


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {

    elements.sidebar?.classList.add(
        "open"
    );

    elements.sidebarOverlay?.classList.add(
        "active"
    );

}


function closeSidebar() {

    elements.sidebar?.classList.remove(
        "open"
    );

    elements.sidebarOverlay?.classList.remove(
        "active"
    );

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function loadUserInformation() {

    let user = null;


    try {

        const raw =
            localStorage.getItem(
                "atlas_usuario"
            );


        if (raw) {

            user =
                JSON.parse(raw);

        }

    } catch (error) {

        console.warn(
            "Não foi possível carregar o usuário.",
            error
        );

    }


    /*
     * Compatibilidade com estruturas
     * de login diferentes.
     */

    if (!user) {

        user = {

            nome:
                localStorage.getItem(
                    "atlas_user_name"
                ) ||
                "Administrador",

            email:
                localStorage.getItem(
                    "atlas_user_email"
                ) ||
                "admin@atlasgestao.com",

            cargo:
                localStorage.getItem(
                    "atlas_user_role"
                ) ||
                "Administrador"

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


    const initial =
        getInitial(
            name
        );


    elements.sidebarUserName.textContent =
        name;

    elements.sidebarUserRole.textContent =
        role;

    elements.sidebarUserAvatar.textContent =
        initial;


    elements.topbarUserName.textContent =
        name;

    elements.topbarUserRole.textContent =
        role;

    elements.topbarAvatar.textContent =
        initial;


    elements.profileMenuName.textContent =
        name;

    elements.profileMenuEmail.textContent =
        email;

    elements.profileMenuAvatar.textContent =
        initial;

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    /*
     * Não apagamos os produtos ao sair.
     */

    const confirmation =
        window.confirm(
            "Deseja realmente sair do Atlas Gestão?"
        );


    if (!confirmation) {

        return;

    }


    /*
     * Remove somente informações
     * relacionadas à sessão.
     */

    localStorage.removeItem(
        "atlas_usuario"
    );

    localStorage.removeItem(
        "atlas_user"
    );

    localStorage.removeItem(
        "atlas_user_name"
    );

    localStorage.removeItem(
        "atlas_user_email"
    );

    localStorage.removeItem(
        "atlas_user_role"
    );


    window.location.href =
        "index.html";

}


/* =========================================================
   EXPORTAÇÃO CSV
   ========================================================= */

function exportProductsCSV() {

    const products =
        productsState.filteredProducts;


    if (products.length === 0) {

        showToast(
            "Não existem produtos para exportar.",
            "error"
        );

        return;

    }


    const headers = [

        "Código",

        "Nome",

        "Categoria",

        "Estoque",

        "Estoque Mínimo",

        "Unidade",

        "Preço",

        "Fornecedor",

        "Status",

        "Descrição"

    ];


    const rows =
        products.map(
            product => [

                product.codigo,

                product.nome,

                product.categoria,

                product.estoque,

                product.estoqueMinimo,

                product.unidade,

                product.preco
                    .toFixed(2)
                    .replace(".", ","),

                product.fornecedor,

                product.status,

                product.descricao

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
                            csvEscape(value)
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


    link.href =
        url;

    link.download =
        `atlas-produtos-${getDateForFile()}.csv`;


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Produtos exportados com sucesso.",
        "success"
    );

}


/* =========================================================
   CSV ESCAPE
   ========================================================= */

function csvEscape(value) {

    const text =
        String(
            value ?? ""
        );


    return `"${text.replace(
        /"/g,
        '""'
    )}"`;

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message,
    type = "success"
) {

    elements.productToastMessage.textContent =
        message;


    elements.productToastIcon.className =
        type === "error"
            ? "fa-solid fa-circle-exclamation"
            : "fa-solid fa-circle-check";


    elements.productToastIcon.style.color =
        type === "error"
            ? "#EF4444"
            : "#22C55E";


    elements.productToast.classList.add(
        "show"
    );


    clearTimeout(
        window.atlasProductToastTimeout
    );


    window.atlasProductToastTimeout =
        setTimeout(
            hideToast,
            3500
        );

}


function hideToast() {

    elements.productToast.classList.remove(
        "show"
    );

}


/* =========================================================
   ERRO DO FORMULÁRIO
   ========================================================= */

function showProductFormError(
    message
) {

    const span =
        elements.productFormError.querySelector(
            "span"
        );


    if (span) {

        span.textContent =
            message;

    }


    elements.productFormError.hidden =
        false;

}


function clearProductFormError() {

    elements.productFormError.hidden =
        true;

}


/* =========================================================
   TECLADO
   ========================================================= */

function handleKeyboard(event) {

    /*
     * ESC fecha modais.
     */

    if (
        event.key === "Escape"
    ) {

        closeProductModal();

        closeDeleteModal();

        elements.notificationPanel?.classList.remove(
            "active"
        );

        elements.profileMenu?.classList.remove(
            "active"
        );

        closeSidebar();

    }


    /*
     * "/" ativa a pesquisa.
     */

    if (
        event.key === "/" &&
        !isTypingTarget(event.target)
    ) {

        event.preventDefault();

        elements.productSearch?.focus();

    }


    /*
     * CTRL + N abre novo produto.
     */

    if (
        event.ctrlKey &&
        event.key.toLowerCase() === "n"
    ) {

        event.preventDefault();

        openProductModal();

    }

}


/* =========================================================
   HELPERS
   ========================================================= */

function generateId() {

    return (

        Date.now().toString(36) +

        Math.random()
            .toString(36)
            .substring(2, 9)

    );

}


function generateProductCode() {

    const number =
        productsState.products.length +
        1;


    let code =
        `PROD-${String(number).padStart(
            3,
            "0"
        )}`;


    const exists =
        productsState.products.some(
            product =>
                product.codigo === code
        );


    if (exists) {

        return generateUniqueCode();

    }


    return code;

}


function generateUniqueCode() {

    let number =
        productsState.products.length +
        1;


    let code;


    do {

        code =
            `PROD-${String(number).padStart(
                3,
                "0"
            )}`;

        number++;

    } while (
        productsState.products.some(
            product =>
                product.codigo === code
        )
    );


    return code;

}


function formatCurrency(value) {

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


function formatNumber(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "pt-BR"
    );

}


function getInitial(name) {

    const cleanName =
        String(
            name || ""
        ).trim();


    if (!cleanName) {

        return "A";

    }


    return cleanName
        .charAt(0)
        .toUpperCase();

}


function isTypingTarget(target) {

    if (!target) {

        return false;

    }


    const tag =
        target.tagName?.toLowerCase();


    return (

        tag === "input" ||

        tag === "textarea" ||

        tag === "select" ||

        target.isContentEditable

    );

}


function escapeHtml(value) {

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


function getDateForFile() {

    const date =
        new Date();


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   API GLOBAL
   ========================================================= */

window.AtlasProdutos = {

    getAll() {

        return [
            ...productsState.products
        ];

    },


    getById(id) {

        return productsState.products.find(
            product =>
                product.id === id
        );

    },


    getLowStock() {

        return productsState.products.filter(
            product => {

                const status =
                    getStockStatus(
                        product
                    );

                return (
                    status.type === "low" ||
                    status.type === "out"
                );

            }
        );

    },


    refresh() {

        loadProducts();

        populateCategories();

        applyFilters();

        updateStatistics();

        updateStockAlert();

        updateNotifications();

    }

};
```
