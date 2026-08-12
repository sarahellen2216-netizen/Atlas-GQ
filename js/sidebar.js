/* ============================================================
   ATLAS GESTÃO
   SIDEBAR GLOBAL
   Não altera o conteúdo das páginas.
   Apenas padroniza o menu lateral.
   ============================================================ */

(function () {

    "use strict";

    document.addEventListener("DOMContentLoaded", function () {

        criarSidebar();

        marcarPaginaAtual();

        carregarUsuario();

        atualizarBadgeQualidade();

        configurarLogout();

        configurarMenuMobile();

    });


    /* =========================================================
       CRIAR SIDEBAR
       ========================================================= */

    function criarSidebar() {

        let sidebar = document.querySelector(".sidebar");

        /*
         * Se a página já possui uma sidebar antiga,
         * vamos reaproveitar o elemento.
         *
         * Assim não mexemos no restante da página.
         */

        if (!sidebar) {

            sidebar = document.createElement("aside");

            sidebar.className = "sidebar";

            document.body.insertBefore(
                sidebar,
                document.body.firstChild
            );

        }


        sidebar.innerHTML = `

            <div class="sidebar-logo">

                <div class="logo-icon">
                    <i class="fas fa-layer-group"></i>
                </div>

                <div class="logo-text">
                    <strong>Atlas</strong>
                    <span>Gestão</span>
                </div>

            </div>


            <nav class="sidebar-menu">


                <!-- =========================
                     PRINCIPAL
                     ========================= -->

                <div class="menu-section">

                    <span class="menu-section-title">
                        PRINCIPAL
                    </span>


                    <a
                        href="dashboard.html"
                        class="menu-item"
                    >
                        <i class="fas fa-chart-pie"></i>
                        <span>Dashboard</span>
                    </a>


                    <a
                        href="produtos.html"
                        class="menu-item"
                    >
                        <i class="fas fa-box"></i>
                        <span>Produtos</span>
                    </a>


                    <a
                        href="financeiro.html"
                        class="menu-item"
                    >
                        <i class="fas fa-wallet"></i>
                        <span>Financeiro</span>
                    </a>


                    <a
                        href="vendas.html"
                        class="menu-item"
                    >
                        <i class="fas fa-shopping-cart"></i>
                        <span>Vendas</span>
                    </a>


                    <a
                        href="equipe.html"
                        class="menu-item"
                    >
                        <i class="fas fa-users"></i>
                        <span>Equipe</span>
                    </a>

                </div>


                <!-- =========================
                     QUALIDADE
                     ========================= -->

                <div class="menu-section">

                    <span class="menu-section-title">
                        QUALIDADE
                    </span>


                    <a
                        href="qualidade.html"
                        class="menu-item"
                    >

                        <i class="fas fa-shield-alt"></i>

                        <span>Qualidade</span>

                        <span
                            id="menuBadgeQualidade"
                            class="menu-badge"
                        >
                            0
                        </span>

                    </a>


                    <a
                        href="auditorias.html"
                        class="menu-item"
                    >

                        <i class="fas fa-clipboard-check"></i>

                        <span>Auditorias</span>

                    </a>


                    <a
                        href="documentos.html"
                        class="menu-item"
                    >

                        <i class="fas fa-file-alt"></i>

                        <span>Documentos</span>

                    </a>

                </div>


                <!-- =========================
                     SISTEMA
                     ========================= -->

                <div class="menu-section">

                    <span class="menu-section-title">
                        SISTEMA
                    </span>


                    <a
                        href="contato.html"
                        class="menu-item"
                    >

                        <i class="fas fa-envelope"></i>

                        <span>Contato</span>

                    </a>


                    <a
                        href="configuracoes.html"
                        class="menu-item"
                    >

                        <i class="fas fa-cog"></i>

                        <span>Configurações</span>

                    </a>

                </div>

            </nav>


            <!-- =========================
                 USUÁRIO
                 ========================= -->

            <div class="sidebar-user">

                <div class="user-avatar">

                    <i class="fas fa-user"></i>

                </div>


                <div class="user-info">

                    <strong id="sidebarUserName">
                        Administrador
                    </strong>

                    <span id="sidebarUserEmail">
                        admin@atlasgestao.com
                    </span>

                </div>


                <button
                    type="button"
                    id="btnLogout"
                    class="logout-button"
                    title="Sair"
                >

                    <i class="fas fa-sign-out-alt"></i>

                </button>

            </div>

        `;

    }


    /* =========================================================
       IDENTIFICAR PÁGINA ATUAL
       ========================================================= */

    function marcarPaginaAtual() {

        let paginaAtual =
            window.location.pathname
                .split("/")
                .pop()
                .toLowerCase();


        /*
         * Quando estiver no endereço raiz,
         * consideramos index.html.
         */

        if (!paginaAtual) {
            paginaAtual = "index.html";
        }


        const links =
            document.querySelectorAll(
                ".sidebar .menu-item"
            );


        links.forEach(function (link) {

            const href =
                link.getAttribute("href");


            if (!href) return;


            const paginaLink =
                href
                    .split("/")
                    .pop()
                    .toLowerCase();


            if (paginaLink === paginaAtual) {

                link.classList.add("active");

            } else {

                link.classList.remove("active");

            }

        });

    }


    /* =========================================================
       USUÁRIO
       ========================================================= */

    function carregarUsuario() {

        let usuario = null;


        /*
         * Tenta encontrar os formatos que já podem
         * existir no seu projeto.
         */

        const chaves = [
            "atlas_usuario",
            "usuario",
            "usuarioLogado",
            "loggedUser"
        ];


        for (let i = 0; i < chaves.length; i++) {

            try {

                const valor =
                    localStorage.getItem(
                        chaves[i]
                    );


                if (valor) {

                    usuario =
                        JSON.parse(valor);

                    break;

                }

            } catch (erro) {

                console.warn(
                    "Erro ao ler usuário:",
                    erro
                );

            }

        }


        if (!usuario) return;


        const nome =
            document.getElementById(
                "sidebarUserName"
            );


        const email =
            document.getElementById(
                "sidebarUserEmail"
            );


        if (nome) {

            nome.textContent =
                usuario.nome ||
                usuario.name ||
                "Administrador";

        }


        if (email) {

            email.textContent =
                usuario.email ||
                "admin@atlasgestao.com";

        }

    }


    /* =========================================================
       BADGE DE QUALIDADE
       ========================================================= */

    function atualizarBadgeQualidade() {

        const badge =
            document.getElementById(
                "menuBadgeQualidade"
            );


        if (!badge) return;


        let total = 0;


        /*
         * Verifica possíveis nomes usados pelo
         * banco LocalStorage.
         */

        const chaves = [
            "atlas_inspecoes",
            "inspecoes",
            "inspections"
        ];


        for (let i = 0; i < chaves.length; i++) {

            try {

                const dados =
                    JSON.parse(
                        localStorage.getItem(
                            chaves[i]
                        )
                    );


                if (Array.isArray(dados)) {

                    total =
                        dados.filter(function (item) {

                            return (
                                item.resultado ===
                                "Não Conforme"
                            ) ||
                            (
                                item.resultado ===
                                "Nao Conforme"
                            ) ||
                            (
                                item.status ===
                                "Não Conforme"
                            );

                        }).length;

                    break;

                }

            } catch (erro) {

                console.warn(
                    "Erro ao calcular qualidade:",
                    erro
                );

            }

        }


        badge.textContent = total;


        if (total > 0) {

            badge.style.display = "flex";

        } else {

            badge.style.display = "none";

        }

    }


    /* =========================================================
       LOGOUT
       ========================================================= */

    function configurarLogout() {

        const botao =
            document.getElementById(
                "btnLogout"
            );


        if (!botao) return;


        botao.addEventListener(
            "click",
            function () {

                const confirmar =
                    confirm(
                        "Deseja realmente sair do Atlas Gestão?"
                    );


                if (!confirmar) return;


                /*
                 * Remove apenas os dados relacionados
                 * ao login.
                 *
                 * NÃO apaga produtos, vendas,
                 * financeiro ou qualidade.
                 */

                localStorage.removeItem(
                    "atlas_usuario"
                );

                localStorage.removeItem(
                    "usuario"
                );

                localStorage.removeItem(
                    "usuarioLogado"
                );


                window.location.href =
                    "index.html";

            }
        );

    }


    /* =========================================================
       MENU MOBILE
       ========================================================= */

    function configurarMenuMobile() {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        if (!sidebar) return;


        /*
         * Se já existe botão mobile,
         * não cria outro.
         */

        if (
            document.querySelector(
                ".mobile-menu-button"
            )
        ) {
            return;
        }


        const botao =
            document.createElement(
                "button"
            );


        botao.className =
            "mobile-menu-button";


        botao.innerHTML =
            '<i class="fas fa-bars"></i>';


        document.body.appendChild(
            botao
        );


        botao.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "mobile-open"
                );

            }
        );

    }

})();
