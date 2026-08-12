/* ==========================================================
   ATLAS GESTÃO
   DASHBOARD.JS
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       UTILIDADES
    ====================================================== */

    function getArrayFromStorage(keys) {

        for (const key of keys) {

            try {

                const value =
                    JSON.parse(localStorage.getItem(key));

                if (Array.isArray(value)) {
                    return value;
                }

            } catch (error) {

                console.warn(
                    "Erro ao ler:",
                    key,
                    error
                );

            }

        }

        return [];

    }


    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    }


    function formatDate(date) {

        const d = new Date(date);

        if (isNaN(d.getTime())) {
            return "--/--/----";
        }

        return d.toLocaleDateString(
            "pt-BR"
        );

    }


    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();

    }


    /* ======================================================
       DATA ATUAL
    ====================================================== */

    setText(
        "currentDate",
        new Date().toLocaleDateString("pt-BR")
    );


    /* ======================================================
       PERFIL
    ====================================================== */

    function loadUser() {

        let user = null;


        const possibleKeys = [

            "atlasPerfil",
            "atlasUsuario",
            "usuario",
            "user",
            "currentUser"

        ];


        for (const key of possibleKeys) {

            try {

                const value =
                    JSON.parse(
                        localStorage.getItem(key)
                    );

                if (value) {

                    user = value;

                    break;

                }

            } catch (error) {}

        }


        const name =
            user?.nome ||
            user?.name ||
            "Administrador";


        setText(
            "welcomeName",
            name
        );

        setText(
            "topUserName",
            name
        );


        const initial =
            name
                .charAt(0)
                .toUpperCase();


        setText(
            "userInitial",
            initial
        );

    }


    loadUser();


    /* ======================================================
       INSPEÇÕES
    ====================================================== */

    const inspections =
        getArrayFromStorage([

            "atlasInspecoes",
            "inspecoes",
            "inspections",
            "qualidadeInspecoes"

        ]);


    /* ======================================================
       CLASSIFICAÇÃO
    ====================================================== */

    function isConform(item) {

        const result =
            normalize(
                item.resultado ||
                item.status ||
                item.result ||
                item.conformidade
            );


        return (

            result === "conforme" ||

            result === "aprovado" ||

            result === "aprovada" ||

            result === "ok"

        );

    }


    function isNonConform(item) {

        const result =
            normalize(
                item.resultado ||
                item.status ||
                item.result ||
                item.conformidade
            );


        return (

            result === "nao conforme" ||

            result === "nao_conforme" ||

            result === "reprovado" ||

            result === "reprovada" ||

            result === "nc"

        );

    }


    const conform =
        inspections.filter(
            isConform
        ).length;


    const nonConform =
        inspections.filter(
            isNonConform
        ).length;


    const totalInspections =
        inspections.length;


    const compliance =
        totalInspections > 0
            ? Math.round(
                (conform / totalInspections) * 100
            )
            : 0;


    /* ======================================================
       CARDS
    ====================================================== */

    setText(
        "totalInspections",
        totalInspections
    );


    setText(
        "complianceRate",
        compliance + "%"
    );


    setText(
        "summaryCompliance",
        compliance + "%"
    );


    setText(
        "summaryConform",
        conform
    );


    setText(
        "summaryNonConform",
        nonConform
    );


    setText(
        "chartTotal",
        totalInspections
    );


    setText(
        "conformCount",
        conform
    );


    setText(
        "nonConformCount",
        nonConform
    );


    /* ======================================================
       GRÁFICO DONUT
    ====================================================== */

    const donut =
        document.getElementById(
            "donutChart"
        );


    if (donut) {

        donut.style.setProperty(
            "--conforme",
            compliance + "%"
        );

    }


    /* ======================================================
       NÃO CONFORMIDADES
    ====================================================== */

    const nonConformities =
        getArrayFromStorage([

            "atlasNaoConformidades",
            "naoConformidades",
            "nao_conformidades",
            "ncs"

        ]);


    const totalNC =
        nonConformities.length;


    const openNC =
        nonConformities.filter(
            item => {

                const status =
                    normalize(
                        item.status
                    );

                return (

                    status === "aberta" ||

                    status === "aberto" ||

                    status === "pendente" ||

                    status === "em aberto"

                );

            }
        ).length;


    const analysisNC =
        nonConformities.filter(
            item => {

                const status =
                    normalize(
                        item.status
                    );

                return (

                    status === "em analise" ||

                    status === "analise"

                );

            }
        ).length;


    const closedNC =
        nonConformities.filter(
            item => {

                const status =
                    normalize(
                        item.status
                    );

                return (

                    status === "encerrada" ||

                    status === "encerrado" ||

                    status === "concluida" ||

                    status === "fechada"

                );

            }
        ).length;


    setText(
        "totalNC",
        totalNC
    );


    setText(
        "openNC",
        openNC
    );


    setText(
        "analysisNC",
        analysisNC
    );


    setText(
        "closedNC",
        closedNC
    );


    setText(
        "openNonConformities",
        openNC
    );


    /* ======================================================
       AÇÕES CORRETIVAS
    ====================================================== */

    const actions =
        getArrayFromStorage([

            "atlasAcoes",
            "acoesCorretivas",
            "acoes",
            "acoesCorretivasQualidade"

        ]);


    const pendingActions =
        actions.filter(
            item => {

                const status =
                    normalize(
                        item.status
                    );

                return (

                    status !== "concluida" &&

                    status !== "concluido" &&

                    status !== "encerrada" &&

                    status !== "encerrado"

                );

            }
        );


    const today =
        new Date();


    const lateActions =
        pendingActions.filter(
            item => {

                const date =
                    item.prazo ||
                    item.dataLimite ||
                    item.dataVencimento ||
                    item.deadline;


                if (!date) {
                    return false;
                }


                const due =
                    new Date(date);


                return (
                    !isNaN(due.getTime()) &&
                    due < today
                );

            }
        );


    setText(
        "pendingActions",
        pendingActions.length
    );


    setText(
        "lateActions",
        lateActions.length +
        " atrasadas"
    );


    /* ======================================================
       AUDITORIAS
    ====================================================== */

    const audits =
        getArrayFromStorage([

            "atlasAuditorias",
            "auditorias",
            "audits"

        ]);


    setText(
        "summaryAudits",
        audits.length
    );


    /* ======================================================
       INSPEÇÕES RECENTES
    ====================================================== */

    const table =
        document.getElementById(
            "recentInspections"
        );


    if (table) {

        if (inspections.length === 0) {

            table.innerHTML = `

                <tr>

                    <td colspan="4">

                        <div class="empty-table">

                            Nenhuma inspeção cadastrada.

                        </div>

                    </td>

                </tr>

            `;

        } else {

            const recent =
                [...inspections]
                    .sort(
                        (a, b) => {

                            const dateA =
                                new Date(
                                    a.data ||
                                    a.date ||
                                    a.dataInspecao ||
                                    0
                                );

                            const dateB =
                                new Date(
                                    b.data ||
                                    b.date ||
                                    b.dataInspecao ||
                                    0
                                );

                            return dateB - dateA;

                        }
                    )
                    .slice(0, 5);


            table.innerHTML =
                recent.map(
                    item => {

                        const product =
                            item.produto ||
                            item.product ||
                            item.nomeProduto ||
                            "-";


                        const responsible =
                            item.responsavel ||
                            item.responsible ||
                            item.usuario ||
                            "-";


                        const date =
                            item.data ||
                            item.date ||
                            item.dataInspecao;


                        const result =
                            item.resultado ||
                            item.result ||
                            item.status ||
                            "-";


                        const resultClass =
                            isConform(item)
                                ? "result-conform"
                                : isNonConform(item)
                                    ? "result-nonconform"
                                    : "result-neutral";


                        return `

                            <tr>

                                <td>
                                    ${escapeHtml(product)}
                                </td>

                                <td>
                                    ${escapeHtml(responsible)}
                                </td>

                                <td>
                                    ${formatDate(date)}
                                </td>

                                <td>

                                    <span
                                        class="result-badge ${resultClass}"
                                    >

                                        ${escapeHtml(result)}

                                    </span>

                                </td>

                            </tr>

                        `;

                    }
                ).join("");

        }

    }


    /* ======================================================
       AÇÕES PENDENTES
    ====================================================== */

    const actionsList =
        document.getElementById(
            "pendingActionsList"
        );


    if (actionsList) {

        if (pendingActions.length === 0) {

            actionsList.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">

                        <i class="fa-solid fa-circle-check"></i>

                    </div>

                    <strong>
                        Tudo em dia!
                    </strong>

                    <span>
                        Nenhuma ação pendente.
                    </span>

                </div>

            `;

        } else {

            actionsList.innerHTML =
                pendingActions
                    .slice(0, 4)
                    .map(
                        item => {

                            const title =
                                item.titulo ||
                                item.descricao ||
                                item.acao ||
                                "Ação corretiva";


                            const due =
                                item.prazo ||
                                item.dataLimite ||
                                item.dataVencimento;


                            return `

                                <div class="pending-action-item">

                                    <div class="pending-action-icon">

                                        <i class="fa-solid fa-list-check"></i>

                                    </div>

                                    <div>

                                        <strong>
                                            ${escapeHtml(title)}
                                        </strong>

                                        <span>
                                            Prazo:
                                            ${formatDate(due)}
                                        </span>

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("");

        }

    }


    /* ======================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* ======================================================
       MENU MOBILE
    ====================================================== */

    const mobileMenu =
        document.getElementById(
            "mobileMenu"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* ======================================================
       LOGOUT
    ====================================================== */

    const logout =
        document.getElementById(
            "logoutButton"
        );


    if (logout) {

        logout.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    confirm(
                        "Deseja realmente sair do Atlas Gestão?"
                    );


                if (!confirmLogout) {
                    return;
                }


                localStorage.removeItem(
                    "atlasUsuario"
                );


                localStorage.removeItem(
                    "usuarioLogado"
                );


                window.location.href =
                    "index.html";

            }
        );

    }


    /* ======================================================
       NOTIFICAÇÕES
    ====================================================== */

    const notificationCount =
        document.getElementById(
            "notificationCount"
        );


    const notificationButton =
        document.getElementById(
            "notificationButton"
        );


    const notificationTotal =
        openNC +
        pendingActions.length;


    if (notificationCount) {

        notificationCount.textContent =
            notificationTotal;

    }


    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            function () {

                if (notificationTotal === 0) {

                    alert(
                        "Nenhuma notificação pendente."
                    );

                } else {

                    alert(
                        "Você possui " +
                        notificationTotal +
                        " item(ns) pendente(s)."
                    );

                }

            }
        );

    }


    /* ======================================================
       FILTRO DO GRÁFICO
    ====================================================== */

    const filters =
        document.querySelectorAll(
            ".chart-filter"
        );


    filters.forEach(
        filter => {

            filter.addEventListener(
                "click",
                function () {

                    filters.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    filter.classList.add(
                        "active"
                    );


                    if (
                        filter.dataset.period ===
                        "month"
                    ) {

                        updateMonthlyChart();

                    } else {

                        updateGeneralChart();

                    }

                }
            );

        }
    );


    function updateGeneralChart() {

        const total =
            inspections.length;


        const conformGeneral =
            inspections.filter(
                isConform
            ).length;


        const rate =
            total > 0
                ? Math.round(
                    (conformGeneral / total) *
                    100
                )
                : 0;


        setText(
            "chartTotal",
            total
        );


        setText(
            "conformCount",
            conformGeneral
        );


        setText(
            "nonConformCount",
            total - conformGeneral
        );


        if (donut) {

            donut.style.setProperty(
                "--conforme",
                rate + "%"
            );

        }

    }


    function updateMonthlyChart() {

        const now =
            new Date();


        const currentMonth =
            now.getMonth();


        const currentYear =
            now.getFullYear();


        const monthInspections =
            inspections.filter(
                item => {

                    const date =
                        new Date(
                            item.data ||
                            item.date ||
                            item.dataInspecao
                        );


                    return (

                        !isNaN(date.getTime()) &&

                        date.getMonth() ===
                            currentMonth &&

                        date.getFullYear() ===
                            currentYear

                    );

                }
            );


        const monthlyConform =
            monthInspections.filter(
                isConform
            ).length;


        const monthlyTotal =
            monthInspections.length;


        const monthlyRate =
            monthlyTotal > 0
                ? Math.round(
                    (
                        monthlyConform /
                        monthlyTotal
                    ) * 100
                )
                : 0;


        setText(
            "chartTotal",
            monthlyTotal
        );


        setText(
            "conformCount",
            monthlyConform
        );


        setText(
            "nonConformCount",
            monthlyTotal -
            monthlyConform
        );


        if (donut) {

            donut.style.setProperty(
                "--conforme",
                monthlyRate + "%"
            );

        }

    }


    /* ======================================================
       PESQUISA GLOBAL
    ====================================================== */

    const globalSearch =
        document.getElementById(
            "globalSearch"
        );


    const overlay =
        document.getElementById(
            "searchOverlay"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const closeSearch =
        document.getElementById(
            "closeSearch"
        );


    const results =
        document.getElementById(
            "searchResults"
        );


    if (globalSearch && overlay) {

        globalSearch.addEventListener(
            "focus",
            function () {

                overlay.classList.add(
                    "open"
                );


                if (searchInput) {

                    searchInput.focus();

                }

            }
        );

    }


    if (closeSearch && overlay) {

        closeSearch.addEventListener(
            "click",
            function () {

                overlay.classList.remove(
                    "open"
                );

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    overlay.classList.remove(
                        "open"
                    );

                }

            }
        );

    }


    if (searchInput && results) {

        searchInput.addEventListener(
            "input",
            function () {

                const query =
                    normalize(
                        searchInput.value
                    );


                if (!query) {

                    results.innerHTML = `

                        <p>
                            Digite para pesquisar no sistema.
                        </p>

                    `;

                    return;

                }


                const products =
                    getArrayFromStorage([
                        "atlasProdutos",
                        "produtos"
                    ]);


                const employees =
                    getArrayFromStorage([
                        "atlasFuncionarios",
                        "funcionarios",
                        "equipe"
                    ]);


                const allResults = [];


                products.forEach(
                    item => {

                        const name =
                            item.nome ||
                            item.name ||
                            item.produto ||
                            "";


                        if (
                            normalize(name)
                                .includes(query)
                        ) {

                            allResults.push({

                                title: name,

                                type: "Produto",

                                link: "produtos.html"

                            });

                        }

                    }
                );


                employees.forEach(
                    item => {

                        const name =
                            item.nome ||
                            item.name ||
                            "";


                        if (
                            normalize(name)
                                .includes(query)
                        ) {

                            allResults.push({

                                title: name,

                                type: "Funcionário",

                                link: "equipe.html"

                            });

                        }

                    }
                );


                if (allResults.length === 0) {

                    results.innerHTML = `

                        <p>
                            Nenhum resultado encontrado.
                        </p>

                    `;

                    return;

                }


                results.innerHTML =
                    allResults
                        .slice(0, 10)
                        .map(
                            result => `

                                <a
                                    href="${result.link}"
                                    class="search-result-item"
                                >

                                    <i class="fa-solid fa-magnifying-glass"></i>

                                    <div>

                                        <strong>
                                            ${escapeHtml(result.title)}
                                        </strong>

                                        <span>
                                            ${result.type}
                                        </span>

                                    </div>

                                </a>

                            `
                        )
                        .join("");

            }
        );

    }


});
