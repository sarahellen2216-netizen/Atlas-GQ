/* =====================================================
   ATLAS GESTÃO
   SISTEMA GLOBAL
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        createSidebar();

        createTopbar();

        setupMobileMenu();

        setupTheme();

        setupLogout();

        updateNotificationCount();

    }
);


/* =====================================================
   SIDEBAR
===================================================== */

function createSidebar() {

    const container =
        document.getElementById(
            "sidebar-container"
        );

    if (!container) {
        return;
    }

    const page =
        location.pathname
            .split("/")
            .pop() ||
        "dashboard.html";

    const links = [

        {
            group: "PRINCIPAL",
            items: [

                [
                    "dashboard.html",
                    "📊",
                    "Dashboard"
                ],

                [
                    "produtos.html",
                    "📦",
                    "Produtos"
                ],

                [
                    "financeiro.html",
                    "💳",
                    "Financeiro"
                ],

                [
                    "vendas.html",
                    "🛒",
                    "Vendas"
                ],

                [
                    "equipe.html",
                    "👥",
                    "Equipe"
                ]

            ]
        },

        {
            group: "QUALIDADE",
            items: [

                [
                    "qualidade.html",
                    "🛡️",
                    "Qualidade"
                ],

                [
                    "auditorias.html",
                    "☑️",
                    "Auditorias"
                ],

                [
                    "documentos.html",
                    "📄",
                    "Documentos"
                ]

            ]
        },

        {
            group: "SISTEMA",
            items: [

                [
                    "contato.html",
                    "✉️",
                    "Contato"
                ],

                [
                    "configuracoes.html",
                    "⚙️",
                    "Configurações"
                ]

            ]
        }

    ];

    let html = `

        <aside class="atlas-sidebar">

            <div class="brand">

                <div class="brand-icon">
                    A
                </div>

                <div class="brand-name">
                    Atlas <span>Gestão</span>
                </div>

            </div>

    `;

    links.forEach(section => {

        html += `

            <div class="sidebar-section">

                <div class="sidebar-title">
                    ${section.group}
                </div>

        `;

        section.items.forEach(
            ([url, icon, label]) => {

                const active =
                    page === url
                        ? "active"
                        : "";

                html += `

                    <a
                        class="sidebar-link ${active}"
                        href="${url}"
                    >

                        <span class="sidebar-icon">
                            ${icon}
                        </span>

                        <span>
                            ${label}
                        </span>

                    </a>

                `;
            }
        );

        html += `

            </div>

        `;

    });

    html += `

        <div class="sidebar-footer">

            <div class="user-box">

                <div class="user-avatar">
                    A
                </div>

                <div class="user-info">

                    <div class="user-name">
                        Administrador
                    </div>

                    <div class="user-email">
                        admin@atlasgestao.com
                    </div>

                </div>

            </div>

        </div>

        </aside>

    `;

    container.innerHTML = html;
}


/* =====================================================
   TOPBAR
===================================================== */

function createTopbar() {

    const container =
        document.getElementById(
            "topbar-container"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `

        <header class="topbar">

            <button
                class="mobile-menu"
                id="mobileMenu"
                type="button"
            >
                ☰
            </button>

            <div class="topbar-search">

                <input
                    id="globalSearch"
                    type="search"
                    placeholder="Pesquisar..."
                >

            </div>

            <div class="topbar-actions">

                <button
                    class="notification-btn"
                    type="button"
                    id="notificationButton"
                    title="Notificações"
                >

                    🔔

                    <span
                        class="notification-count"
                        id="notificationCount"
                    >
                        0
                    </span>

                </button>

                <div class="top-user">

                    <div class="top-user-avatar">
                        A
                    </div>

                    <div>

                        <strong>
                            Administrador
                        </strong>

                        <div
                            style="
                            font-size:11px;
                            color:#94a3b8;
                            "
                        >
                            Gestor
                        </div>

                    </div>

                </div>

            </div>

        </header>

    `;

}


/* =====================================================
   MOBILE
===================================================== */

function setupMobileMenu() {

    document.addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "mobileMenu"
            ) {

                const sidebar =
                    document.querySelector(
                        ".atlas-sidebar"
                    );

                if (sidebar) {

                    sidebar.classList.toggle(
                        "open"
                    );

                }

            }

        }
    );
}


/* =====================================================
   TEMA
===================================================== */

function setupTheme() {

    const saved =
        localStorage.getItem(
            "atlas_theme"
        );

    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =====================================================
   ALTERAR TEMA
===================================================== */

function toggleAtlasTheme() {

    document.body.classList.toggle(
        "dark"
    );

    const isDark =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "atlas_theme",
        isDark
            ? "dark"
            : "light"
    );

}

window.toggleAtlasTheme =
    toggleAtlasTheme;


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    document.addEventListener(
        "click",
        event => {

            if (
                event.target.closest(
                    "[data-logout]"
                )
            ) {

                localStorage.removeItem(
                    "atlas_logged"
                );

                window.location.href =
                    "index.html";

            }

        }
    );

}


/* =====================================================
   NOTIFICAÇÕES
===================================================== */

function updateNotificationCount() {

    if (
        typeof AtlasDB ===
        "undefined"
    ) {
        return;
    }

    const produtos =
        AtlasDB.get(
            "produtos"
        );

    const inspecoes =
        AtlasDB.get(
            "inspecoes"
        );

    const estoqueBaixo =
        produtos.filter(
            item =>
                Number(item.estoque || 0) <=
                Number(item.estoqueMinimo || 5)
        ).length;

    const pendentes =
        inspecoes.filter(
            item =>
                item.status ===
                "Pendente"
        ).length;

    const total =
        estoqueBaixo +
        pendentes;

    const element =
        document.getElementById(
            "notificationCount"
        );

    if (element) {

        element.textContent =
            total;

    }

}
