document.addEventListener("DOMContentLoaded", () => {

    const page = document.body.dataset.page || "";

    const sidebar = document.getElementById("sidebar");

    if (sidebar) {

        sidebar.innerHTML = `
            <div class="sidebar-header">

                <div class="logo-icon">
                    <i class="fas fa-layer-group"></i>
                </div>

                <div class="logo-text">
                    Atlas <span>Gestão</span>
                </div>

            </div>

            <nav class="sidebar-nav">

                <div class="nav-section">

                    <div class="nav-title">
                        Principal
                    </div>

                    <a href="dashboard.html"
                       class="nav-link"
                       data-page="dashboard">

                        <i class="fas fa-chart-pie"></i>
                        <span>Dashboard</span>

                    </a>

                    <a href="produtos.html"
                       class="nav-link"
                       data-page="produtos">

                        <i class="fas fa-box"></i>
                        <span>Produtos</span>

                    </a>

                    <a href="financeiro.html"
                       class="nav-link"
                       data-page="financeiro">

                        <i class="fas fa-wallet"></i>
                        <span>Financeiro</span>

                    </a>

                    <a href="vendas.html"
                       class="nav-link"
                       data-page="vendas">

                        <i class="fas fa-shopping-cart"></i>
                        <span>Vendas</span>

                    </a>

                    <a href="equipe.html"
                       class="nav-link"
                       data-page="equipe">

                        <i class="fas fa-users"></i>
                        <span>Equipe</span>

                    </a>

                </div>

                <div class="nav-section">

                    <div class="nav-title">
                        Qualidade
                    </div>

                    <a href="qualidade.html"
                       class="nav-link"
                       data-page="qualidade">

                        <i class="fas fa-shield-alt"></i>
                        <span>Qualidade</span>

                        <span id="quality-alert-count"></span>

                    </a>

                    <a href="auditorias.html"
                       class="nav-link"
                       data-page="auditorias">

                        <i class="fas fa-clipboard-check"></i>
                        <span>Auditorias</span>

                    </a>

                    <a href="documentos.html"
                       class="nav-link"
                       data-page="documentos">

                        <i class="fas fa-file-alt"></i>
                        <span>Documentos</span>

                    </a>

                </div>

                <div class="nav-section">

                    <div class="nav-title">
                        Sistema
                    </div>

                    <a href="contato.html"
                       class="nav-link"
                       data-page="contato">

                        <i class="fas fa-envelope"></i>
                        <span>Contato</span>

                    </a>

                    <a href="configuracoes.html"
                       class="nav-link"
                       data-page="configuracoes">

                        <i class="fas fa-cog"></i>
                        <span>Configurações</span>

                    </a>

                </div>

            </nav>

            <div class="sidebar-footer">

                <div class="user-mini">

                    <div class="avatar">
                        A
                    </div>

                    <div>
                        <strong>Administrador</strong>
                        <small>admin@atlasgestao.com</small>
                    </div>

                </div>

            </div>
        `;
    }

    /* =========================
       ACTIVE MENU
    ========================= */

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            if (
                link.dataset.page === page
            ) {
                link.classList.add("active");
            }

        });

    /* =========================
       TOPBAR
    ========================= */

    const topbar = document.getElementById("topbar");

    if (topbar) {

        topbar.innerHTML = `

            <div class="topbar-left">

                <button
                    class="mobile-menu"
                    id="mobileMenu">

                    <i class="fas fa-bars"></i>

                </button>

                <strong class="page-label">
                    ${getPageTitle(page)}
                </strong>

            </div>

            <input
                class="global-search"
                id="globalSearch"
                placeholder="Pesquisar..."
            >

            <div class="topbar-right">

                <div class="notification">

                    <i class="fas fa-bell"></i>

                    <span
                        class="notification-badge"
                        id="notificationCount">
                        0
                    </span>

                </div>

                <div class="user-mini">

                    <div class="avatar">
                        A
                    </div>

                    <div>
                        <strong>Administrador</strong>
                        <small>Administrador</small>
                    </div>

                </div>

            </div>
        `;
    }

    /* =========================
       MOBILE
    ========================= */

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenu) {

        mobileMenu.addEventListener(
            "click",
            () => {

                document
                    .getElementById("sidebar")
                    ?.classList.toggle("open");

            }
        );

    }

    updateQualityAlert();

});

function getPageTitle(page) {

    const titles = {

        dashboard: "Dashboard",
        produtos: "Produtos",
        financeiro: "Financeiro",
        vendas: "Vendas",
        equipe: "Equipe",
        qualidade: "Garantia da Qualidade",
        auditorias: "Auditorias",
        documentos: "Documentos",
        contato: "Contato",
        configuracoes: "Configurações"

    };

    return titles[page] || "Atlas Gestão";
}

function updateQualityAlert() {

    if (!window.AtlasDB) return;

    const inspections =
        AtlasDB.get(AtlasDB.keys.inspeções);

    const nonconformities =
        inspections.filter(
            item => item.resultado === "Não Conforme"
        );

    const element =
        document.getElementById(
            "quality-alert-count"
        );

    if (!element) return;

    if (nonconformities.length > 0) {

        element.className =
            "badge badge-danger";

        element.textContent =
            nonconformities.length;

    } else {

        element.textContent = "";

    }
}
