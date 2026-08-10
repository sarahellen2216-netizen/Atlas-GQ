```javascript
/* =========================================================
   ATLAS GESTÃO
   DASHBOARD.JS
   Dashboard + Garantia da Qualidade
   Armazenamento: LocalStorage
   ========================================================= */

"use strict";

/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const STORAGE_KEYS = {
    produtos: "atlas_produtos",
    vendas: "atlas_vendas",
    funcionarios: "atlas_funcionarios",
    receitas: "atlas_receitas",
    despesas: "atlas_despesas",
    inspecoes: "atlas_inspecoes",
    naoConformidades: "atlas_nao_conformidades",
    usuario: "atlas_usuario",
    notificacoes: "atlas_notificacoes"
};

let receitaChart = null;
let produtosChart = null;
let qualidadeChart = null;


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function getData(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return [];
        }

        const parsed = JSON.parse(data);

        return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
        console.error(
            `Erro ao carregar ${key}:`,
            error
        );

        return [];
    }
}


function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );

}


function formatCurrency(value) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(value) || 0
    );

}


function formatNumber(value) {

    return new Intl.NumberFormat(
        "pt-BR"
    ).format(
        Number(value) || 0
    );

}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return parsed.toLocaleDateString(
        "pt-BR"
    );

}


function getCurrentMonth() {

    const now = new Date();

    return {
        month: now.getMonth(),
        year: now.getFullYear()
    };

}


function isCurrentMonth(date) {

    if (!date) {
        return false;
    }

    const parsed = new Date(date);
    const current = getCurrentMonth();

    return (
        parsed.getMonth() === current.month &&
        parsed.getFullYear() === current.year
    );

}


/* =========================================================
   USUÁRIO
   ========================================================= */

function loadUser() {

    const defaultUser = {
        nome: "Administrador",
        email: "admin@atlasgestao.com.br",
        cargo: "Administrador"
    };

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEYS.usuario
            );

        if (!saved) {
            return defaultUser;
        }

        return {
            ...defaultUser,
            ...JSON.parse(saved)
        };

    } catch {

        return defaultUser;

    }

}


function updateUserInterface() {

    const user = loadUser();

    const userNameElements =
        document.querySelectorAll(
            "[data-user-name]"
        );

    userNameElements.forEach(
        element => {
            element.textContent =
                user.nome;
        }
    );


    const userEmailElements =
        document.querySelectorAll(
            "[data-user-email]"
        );

    userEmailElements.forEach(
        element => {
            element.textContent =
                user.email;
        }
    );


    const userRoleElements =
        document.querySelectorAll(
            "[data-user-role]"
        );

    userRoleElements.forEach(
        element => {
            element.textContent =
                user.cargo;
        }
    );


    const initials =
        getInitials(user.nome);


    document
        .querySelectorAll(
            "[data-user-avatar]"
        )
        .forEach(
            element => {
                element.textContent =
                    initials;
            }
        );

}


function getInitials(name) {

    if (!name) {
        return "AG";
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


/* =========================================================
   DATA E HORA
   ========================================================= */

function updateDate() {

    const element =
        document.querySelector(
            "[data-current-date]"
        );

    if (!element) {
        return;
    }

    const now = new Date();

    element.textContent =
        now.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

}


/* =========================================================
   MÉTRICAS DO DASHBOARD
   ========================================================= */

function updateMetrics() {

    const produtos =
        getData(
            STORAGE_KEYS.produtos
        );

    const vendas =
        getData(
            STORAGE_KEYS.vendas
        );

    const funcionarios =
        getData(
            STORAGE_KEYS.funcionarios
        );

    const receitas =
        getData(
            STORAGE_KEYS.receitas
        );

    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    const totalProdutos =
        produtos.length;


    const totalFuncionarios =
        funcionarios.filter(
            funcionario =>
                funcionario.status !==
                "Inativo"
        ).length;


    const receitaVendas =
        vendas
            .filter(venda =>
                isCurrentMonth(
                    venda.data ||
                    venda.createdAt
                )
            )
            .reduce(
                (
                    total,
                    venda
                ) =>
                    total +
                    Number(
                        venda.valor ||
                        venda.total ||
                        0
                    ),
                0
            );


    const receitaLancada =
        receitas
            .filter(receita =>
                isCurrentMonth(
                    receita.data
                )
            )
            .reduce(
                (
                    total,
                    receita
                ) =>
                    total +
                    Number(
                        receita.valor || 0
                    ),
                0
            );


    const receitaMensal =
        receitaVendas +
        receitaLancada;


    const vendasMes =
        vendas.filter(
            venda =>
                isCurrentMonth(
                    venda.data ||
                    venda.createdAt
                )
        ).length;


    const ocorrencias =
        inspecoes.filter(
            inspeção =>
                String(
                    inspeção.resultado || ""
                ).toLowerCase()
                .includes("não")
        ).length;


    setElementText(
        "[data-total-produtos]",
        formatNumber(
            totalProdutos
        )
    );


    setElementText(
        "[data-total-funcionarios]",
        formatNumber(
            totalFuncionarios
        )
    );


    setElementText(
        "[data-receita-mensal]",
        formatCurrency(
            receitaMensal
        )
    );


    setElementText(
        "[data-total-vendas]",
        formatNumber(
            vendasMes
        )
    );


    setElementText(
        "[data-ocorrencias]",
        formatNumber(
            ocorrencias
        )
    );

}


function setElementText(
    selector,
    value
) {

    const element =
        document.querySelector(
            selector
        );

    if (element) {
        element.textContent = value;
    }

}


/* =========================================================
   INDICADORES DA QUALIDADE
   ========================================================= */

function calculateQuality() {

    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    const total =
        inspecoes.length;


    const conformes =
        inspecoes.filter(
            item =>
                normalize(
                    item.resultado
                ) === "conforme"
        ).length;


    const naoConformes =
        inspecoes.filter(
            item =>
                normalize(
                    item.resultado
                ) === "nao conforme"
        ).length;


    const taxa =
        total > 0
            ? (conformes / total) * 100
            : 0;


    return {
        total,
        conformes,
        naoConformes,
        taxa
    };

}


function normalize(value) {

    return String(
        value || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toLowerCase();

}


function updateQualityIndicators() {

    const quality =
        calculateQuality();


    setElementText(
        "[data-inspecoes-total]",
        formatNumber(
            quality.total
        )
    );


    setElementText(
        "[data-nao-conformidades]",
        formatNumber(
            quality.naoConformes
        )
    );


    setElementText(
        "[data-taxa-conformidade]",
        `${quality.taxa.toFixed(1)}%`
    );


    setElementText(
        "[data-conformes]",
        formatNumber(
            quality.conformes
        )
    );


    const circle =
        document.querySelector(
            "[data-quality-circle]"
        );


    if (circle) {

        const angle =
            Math.round(
                quality.taxa * 3.6
            );

        circle.style.background =
            `conic-gradient(
                #22C55E 0deg,
                #22C55E ${angle}deg,
                #E5E7EB ${angle}deg,
                #E5E7EB 360deg
            )`;

    }

}


/* =========================================================
   GRÁFICO DE RECEITA
   ========================================================= */

function getLastMonths(number = 6) {

    const result = [];

    const now = new Date();

    for (
        let i = number - 1;
        i >= 0;
        i--
    ) {

        const date =
            new Date(
                now.getFullYear(),
                now.getMonth() - i,
                1
            );

        result.push({
            month:
                date.getMonth(),
            year:
                date.getFullYear(),
            label:
                date.toLocaleDateString(
                    "pt-BR",
                    {
                        month: "short"
                    }
                )
        });

    }

    return result;

}


function calculateMonthlyRevenue() {

    const months =
        getLastMonths(6);


    const vendas =
        getData(
            STORAGE_KEYS.vendas
        );


    const receitas =
        getData(
            STORAGE_KEYS.receitas
        );


    return months.map(
        item => {

            const salesValue =
                vendas
                    .filter(venda => {

                        const date =
                            new Date(
                                venda.data ||
                                venda.createdAt
                            );

                        return (
                            date.getMonth() ===
                                item.month &&
                            date.getFullYear() ===
                                item.year
                        );

                    })
                    .reduce(
                        (
                            total,
                            venda
                        ) =>
                            total +
                            Number(
                                venda.valor ||
                                venda.total ||
                                0
                            ),
                        0
                    );


            const revenueValue =
                receitas
                    .filter(receita => {

                        const date =
                            new Date(
                                receita.data
                            );

                        return (
                            date.getMonth() ===
                                item.month &&
                            date.getFullYear() ===
                                item.year
                        );

                    })
                    .reduce(
                        (
                            total,
                            receita
                        ) =>
                            total +
                            Number(
                                receita.valor || 0
                            ),
                        0
                    );


            return (
                salesValue +
                revenueValue
            );

        }
    );

}


function createRevenueChart() {

    const canvas =
        document.querySelector(
            "#revenueChart"
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


    const months =
        getLastMonths(6);


    const values =
        calculateMonthlyRevenue();


    if (receitaChart) {
        receitaChart.destroy();
    }


    receitaChart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels:
                        months.map(
                            item =>
                                item.label
                        ),

                    datasets: [

                        {

                            label:
                                "Receita",

                            data:
                                values,

                            borderColor:
                                "#2563EB",

                            backgroundColor:
                                "rgba(37,99,235,0.08)",

                            borderWidth:
                                2,

                            fill:
                                true,

                            tension:
                                0.4,

                            pointRadius:
                                3,

                            pointHoverRadius:
                                5

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    interaction: {

                        intersect:
                            false,

                        mode:
                            "index"

                    },

                    plugins: {

                        legend: {
                            display:
                                false
                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    context =>
                                        ` Receita: ${formatCurrency(
                                            context.raw
                                        )}`

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                callback:
                                    value =>
                                        formatCurrency(
                                            value
                                        )

                            },

                            grid: {

                                color:
                                    "#F1F5F9"

                            }

                        },

                        x: {

                            grid: {
                                display:
                                    false
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   PRODUTOS MAIS VENDIDOS
   ========================================================= */

function calculateTopProducts() {

    const vendas =
        getData(
            STORAGE_KEYS.vendas
        );


    const products =
        {};


    vendas.forEach(
        venda => {

            const name =
                venda.produtoNome ||
                venda.produto ||
                "Produto";


            const quantity =
                Number(
                    venda.quantidade ||
                    1
                );


            if (!products[name]) {

                products[name] = 0;

            }


            products[name] +=
                quantity;

        }
    );


    return Object.entries(
        products
    )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1]
        )
        .slice(
            0,
            5
        );

}


function createProductsChart() {

    const canvas =
        document.querySelector(
            "#productsChart"
        );


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const topProducts =
        calculateTopProducts();


    if (produtosChart) {
        produtosChart.destroy();
    }


    produtosChart =
        new Chart(
            canvas,
            {
                type: "bar",

                data: {

                    labels:
                        topProducts.map(
                            item =>
                                item[0]
                        ),

                    datasets: [

                        {

                            label:
                                "Quantidade",

                            data:
                                topProducts.map(
                                    item =>
                                        item[1]
                                ),

                            backgroundColor:
                                "#2563EB",

                            borderRadius:
                                6,

                            maxBarThickness:
                                35

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                false
                        }

                    },

                    scales: {

                        y: {

                            beginAtZero:
                                true,

                            ticks: {

                                precision:
                                    0

                            },

                            grid: {

                                color:
                                    "#F1F5F9"

                            }

                        },

                        x: {

                            grid: {
                                display:
                                    false
                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   GRÁFICO DE QUALIDADE
   ========================================================= */

function createQualityChart() {

    const canvas =
        document.querySelector(
            "#qualityChart"
        );


    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) {
        return;
    }


    const quality =
        calculateQuality();


    if (qualidadeChart) {
        qualidadeChart.destroy();
    }


    qualidadeChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: [
                        "Conforme",
                        "Não Conforme"
                    ],

                    datasets: [

                        {

                            data: [
                                quality.conformes,
                                quality.naoConformes
                            ],

                            backgroundColor: [
                                "#22C55E",
                                "#EF4444"
                            ],

                            borderWidth:
                                0

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "72%",

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                usePointStyle:
                                    true,

                                boxWidth:
                                    8,

                                font: {
                                    size:
                                        10
                                }

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   ESTOQUE
   ========================================================= */

function getLowStockProducts() {

    const produtos =
        getData(
            STORAGE_KEYS.produtos
        );


    return produtos.filter(
        produto => {

            const estoque =
                Number(
                    produto.estoque || 0
                );


            const minimo =
                Number(
                    produto.estoqueMinimo ||
                    produto.minimo ||
                    5
                );


            return estoque <= minimo;

        }
    );

}


/* =========================================================
   AÇÕES PENDENTES
   ========================================================= */

function getPendingActions() {

    const actions = [];


    const produtos =
        getData(
            STORAGE_KEYS.produtos
        );


    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    const naoConformidades =
        getData(
            STORAGE_KEYS.naoConformidades
        );


    const lowStock =
        getLowStockProducts();


    lowStock
        .slice(0, 3)
        .forEach(
            produto => {

                actions.push({

                    icon:
                        "fa-box-open",

                    color:
                        "orange",

                    title:
                        `Estoque baixo: ${produto.nome}`,

                    description:
                        `Restam ${produto.estoque || 0} unidades`,

                    priority:
                        "Média",

                    priorityClass:
                        "medium"

                });

            }
        );


    naoConformidades
        .filter(
            item =>
                normalize(
                    item.status
                ) !== "concluida" &&
                normalize(
                    item.status
                ) !== "concluido"
        )
        .slice(0, 3)
        .forEach(
            item => {

                actions.push({

                    icon:
                        "fa-triangle-exclamation",

                    color:
                        "red",

                    title:
                        item.titulo ||
                        "Não conformidade pendente",

                    description:
                        item.descricao ||
                        "Ação corretiva pendente",

                    priority:
                        "Alta",

                    priorityClass:
                        "high"

                });

            }
        );


    inspecoes
        .filter(
            item =>
                !item.resultado
        )
        .slice(0, 2)
        .forEach(
            item => {

                actions.push({

                    icon:
                        "fa-clipboard-check",

                    color:
                        "blue",

                    title:
                        "Inspeção pendente",

                    description:
                        item.produto ||
                        "Inspeção sem resultado",

                    priority:
                        "Baixa",

                    priorityClass:
                        "low"

                });

            }
        );


    return actions.slice(
        0,
        5
    );

}


function renderPendingActions() {

    const container =
        document.querySelector(
            "[data-pending-list]"
        );


    if (!container) {
        return;
    }


    const actions =
        getPendingActions();


    if (!actions.length) {

        container.innerHTML = `

            <div class="list-empty">

                <i class="fa-solid fa-circle-check"></i>

                <strong>
                    Tudo em ordem
                </strong>

                <span>
                    Não existem tarefas pendentes.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        actions
            .map(
                action => `

                    <div class="pending-item">

                        <div class="
                            pending-icon
                            ${action.color}
                        ">

                            <i class="
                                fa-solid
                                ${action.icon}
                            "></i>

                        </div>

                        <div class="pending-content">

                            <strong>
                                ${escapeHTML(
                                    action.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    action.description
                                )}
                            </span>

                        </div>

                        <span class="
                            pending-priority
                            ${action.priorityClass}
                        ">

                            ${action.priority}

                        </span>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   NÃO CONFORMIDADES
   ========================================================= */

function renderNCStatus() {

    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    const abertas =
        inspecoes.filter(
            item =>
                normalize(
                    item.resultado
                ) === "nao conforme" &&
                normalize(
                    item.status
                ) !== "concluida" &&
                normalize(
                    item.status
                ) !== "concluido"
        ).length;


    const andamento =
        inspecoes.filter(
            item =>
                normalize(
                    item.status
                ) === "em andamento"
        ).length;


    const resolvidas =
        inspecoes.filter(
            item =>
                normalize(
                    item.resultado
                ) === "nao conforme" &&
                (
                    normalize(
                        item.status
                    ) === "concluida" ||
                    normalize(
                        item.status
                    ) === "concluido"
                )
        ).length;


    setElementText(
        "[data-nc-abertas]",
        formatNumber(
            abertas
        )
    );


    setElementText(
        "[data-nc-andamento]",
        formatNumber(
            andamento
        )
    );


    setElementText(
        "[data-nc-resolvidas]",
        formatNumber(
            resolvidas
        )
    );


    setElementText(
        "[data-nc-total]",
        formatNumber(
            abertas +
            andamento +
            resolvidas
        )
    );

}


/* =========================================================
   ÚLTIMAS INSPEÇÕES
   ========================================================= */

function renderRecentInspections() {

    const container =
        document.querySelector(
            "[data-recent-inspections]"
        );


    if (!container) {
        return;
    }


    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    const sorted =
        [...inspecoes]
            .sort(
                (
                    a,
                    b
                ) =>
                    new Date(
                        b.data ||
                        b.createdAt ||
                        0
                    ) -
                    new Date(
                        a.data ||
                        a.createdAt ||
                        0
                    )
            )
            .slice(
                0,
                5
            );


    if (!sorted.length) {

        container.innerHTML = `

            <tr>

                <td
                    colspan="4"
                    class="table-empty"
                >

                    Nenhuma inspeção cadastrada.

                </td>

            </tr>

        `;

        return;

    }


    container.innerHTML =
        sorted
            .map(
                item => {

                    const resultado =
                        normalize(
                            item.resultado
                        );


                    const conforme =
                        resultado ===
                        "conforme";


                    return `

                        <tr>

                            <td>

                                <div class="
                                    table-product
                                ">

                                    <div class="
                                        table-product-icon
                                    ">

                                        <i class="
                                            fa-solid
                                            fa-box
                                        "></i>

                                    </div>

                                    <div class="
                                        table-product-info
                                    ">

                                        <strong>
                                            ${escapeHTML(
                                                item.produto ||
                                                "Produto"
                                            )}
                                        </strong>

                                        <span>
                                            ${escapeHTML(
                                                item.responsavel ||
                                                "Responsável não informado"
                                            )}
                                        </span>

                                    </div>

                                </div>

                            </td>

                            <td>
                                ${formatDate(
                                    item.data
                                )}
                            </td>

                            <td>

                                <span class="
                                    status-badge
                                    ${
                                        conforme
                                            ? "success"
                                            : "danger"
                                    }
                                ">

                                    ${
                                        conforme
                                            ? "Conforme"
                                            : "Não Conforme"
                                    }

                                </span>

                            </td>

                            <td>

                                <span class="
                                    status-badge
                                    ${
                                        normalize(
                                            item.status
                                        ) === "concluida"
                                            ? "success"
                                            : "warning"
                                    }
                                ">

                                    ${escapeHTML(
                                        item.status ||
                                        "Pendente"
                                    )}

                                </span>

                            </td>

                        </tr>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   SEGURANÇA HTML
   ========================================================= */

function escapeHTML(value) {

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
   NOTIFICAÇÕES
   ========================================================= */

function generateNotifications() {

    const notifications = [];


    const lowStock =
        getLowStockProducts();


    lowStock.forEach(
        produto => {

            notifications.push({

                id:
                    `stock-${produto.id}`,

                type:
                    "warning",

                icon:
                    "fa-box-open",

                title:
                    "Estoque baixo",

                message:
                    `${produto.nome} está com estoque baixo.`,

                date:
                    new Date().toISOString()

            });

        }
    );


    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    inspecoes
        .filter(
            item =>
                normalize(
                    item.resultado
                ) === "nao conforme"
        )
        .slice(0, 5)
        .forEach(
            item => {

                notifications.push({

                    id:
                        `quality-${item.id}`,

                    type:
                        "danger",

                    icon:
                        "fa-triangle-exclamation",

                    title:
                        "Não conformidade",

                    message:
                        `${item.produto || "Produto"} apresentou não conformidade.`,

                    date:
                        new Date().toISOString()

                });

            }
        );


    saveData(
        STORAGE_KEYS.notificacoes,
        notifications
    );


    return notifications;

}


function renderNotifications() {

    const container =
        document.querySelector(
            "[data-notification-list]"
        );


    if (!container) {
        return;
    }


    const notifications =
        generateNotifications();


    if (!notifications.length) {

        container.innerHTML = `

            <div class="empty-notifications">

                <i class="
                    fa-regular
                    fa-bell-slash
                "></i>

                <span>
                    Nenhuma notificação.
                </span>

            </div>

        `;

        updateNotificationBadge(
            0
        );

        return;

    }


    container.innerHTML =
        notifications
            .slice(
                0,
                8
            )
            .map(
                notification => `

                    <div class="
                        notification-item
                    ">

                        <div class="
                            notification-icon
                            ${notification.type}
                        ">

                            <i class="
                                fa-solid
                                ${notification.icon}
                            "></i>

                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(
                                    notification.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    notification.message
                                )}
                            </span>

                        </div>

                    </div>

                `
            )
            .join("");


    updateNotificationBadge(
        notifications.length
    );

}


function updateNotificationBadge(
    count
) {

    const badge =
        document.querySelector(
            "[data-notification-count]"
        );


    if (!badge) {
        return;
    }


    if (count <= 0) {

        badge.classList.add(
            "hidden"
        );

        return;

    }


    badge.classList.remove(
        "hidden"
    );


    badge.textContent =
        count > 9
            ? "9+"
            : count;

}


/* =========================================================
   MENU LATERAL
   ========================================================= */

function setupSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    const overlay =
        document.querySelector(
            ".sidebar-overlay"
        );


    const openButton =
        document.querySelector(
            ".mobile-menu-button"
        );


    const closeButton =
        document.querySelector(
            ".sidebar-close"
        );


    if (
        !sidebar ||
        !overlay
    ) {
        return;
    }


    function openSidebar() {

        sidebar.classList.add(
            "open"
        );

        overlay.classList.add(
            "active"
        );

        document.body.style.overflow =
            "hidden";

    }


    function closeSidebar() {

        sidebar.classList.remove(
            "open"
        );

        overlay.classList.remove(
            "active"
        );

        document.body.style.overflow =
            "";

    }


    openButton?.addEventListener(
        "click",
        openSidebar
    );


    closeButton?.addEventListener(
        "click",
        closeSidebar
    );


    overlay.addEventListener(
        "click",
        closeSidebar
    );


    document
        .querySelectorAll(
            ".nav-item"
        )
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    closeSidebar
                );

            }
        );

}


/* =========================================================
   NOTIFICAÇÕES
   ========================================================= */

function setupNotifications() {

    const button =
        document.querySelector(
            "[data-notification-button]"
        );


    const dropdown =
        document.querySelector(
            "[data-notification-dropdown]"
        );


    const closeAllButton =
        document.querySelector(
            "[data-clear-notifications]"
        );


    if (
        !button ||
        !dropdown
    ) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "hidden"
            );

        }
    );


    dropdown.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );


    closeAllButton?.addEventListener(
        "click",
        () => {

            saveData(
                STORAGE_KEYS.notificacoes,
                []
            );

            dropdown.classList.add(
                "hidden"
            );

            updateNotificationBadge(
                0
            );

        }
    );


    document.addEventListener(
        "click",
        () => {

            dropdown.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================================
   PERFIL
   ========================================================= */

function setupProfile() {

    const button =
        document.querySelector(
            "[data-profile-button]"
        );


    const dropdown =
        document.querySelector(
            "[data-profile-dropdown]"
        );


    if (
        !button ||
        !dropdown
    ) {
        return;
    }


    button.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            dropdown.classList.toggle(
                "hidden"
            );

        }
    );


    dropdown.addEventListener(
        "click",
        event => {
            event.stopPropagation();
        }
    );


    document.addEventListener(
        "click",
        () => {

            dropdown.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================================
   PESQUISA GLOBAL
   ========================================================= */

function setupGlobalSearch() {

    const openButton =
        document.querySelector(
            "[data-open-search]"
        );


    const modal =
        document.querySelector(
            "[data-search-modal]"
        );


    const closeButton =
        document.querySelector(
            "[data-close-search]"
        );


    const input =
        document.querySelector(
            "[data-global-search]"
        );


    const results =
        document.querySelector(
            "[data-search-results]"
        );


    if (!modal) {
        return;
    }


    function openSearch() {

        modal.classList.remove(
            "hidden"
        );

        setTimeout(
            () =>
                input?.focus(),
            100
        );

    }


    function closeSearch() {

        modal.classList.add(
            "hidden"
        );

        if (input) {
            input.value = "";
        }

        if (results) {
            results.innerHTML = "";
        }

    }


    openButton?.addEventListener(
        "click",
        openSearch
    );


    closeButton?.addEventListener(
        "click",
        closeSearch
    );


    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeSearch();

            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "/" &&
                document.activeElement !==
                    input
            ) {

                event.preventDefault();

                openSearch();

            }


            if (
                event.key === "Escape"
            ) {

                closeSearch();

            }

        }
    );


    input?.addEventListener(
        "input",
        () => {

            searchDashboard(
                input.value,
                results
            );

        }
    );

}


function searchDashboard(
    query,
    container
) {

    if (!container) {
        return;
    }


    const term =
        normalize(query);


    if (!term) {

        container.innerHTML = `

            <div class="search-hint">

                <i class="
                    fa-solid
                    fa-magnifying-glass
                "></i>

                <span>
                    Digite para pesquisar no sistema.
                </span>

            </div>

        `;

        return;

    }


    const results = [];


    const produtos =
        getData(
            STORAGE_KEYS.produtos
        );


    produtos.forEach(
        produto => {

            if (
                normalize(
                    produto.nome
                ).includes(term) ||
                normalize(
                    produto.codigo
                ).includes(term)
            ) {

                results.push({

                    icon:
                        "fa-box",

                    title:
                        produto.nome,

                    description:
                        `Produto • ${produto.codigo || "Sem código"}`,

                    url:
                        "produtos.html"

                });

            }

        }
    );


    const funcionarios =
        getData(
            STORAGE_KEYS.funcionarios
        );


    funcionarios.forEach(
        funcionario => {

            if (
                normalize(
                    funcionario.nome
                ).includes(term) ||
                normalize(
                    funcionario.cargo
                ).includes(term)
            ) {

                results.push({

                    icon:
                        "fa-user",

                    title:
                        funcionario.nome,

                    description:
                        `Colaborador • ${funcionario.cargo || "Sem cargo"}`,

                    url:
                        "equipe.html"

                });

            }

        }
    );


    const inspecoes =
        getData(
            STORAGE_KEYS.inspecoes
        );


    inspecoes.forEach(
        item => {

            if (
                normalize(
                    item.produto
                ).includes(term) ||
                normalize(
                    item.responsavel
                ).includes(term)
            ) {

                results.push({

                    icon:
                        "fa-clipboard-check",

                    title:
                        item.produto ||
                        "Inspeção",

                    description:
                        `Inspeção • ${item.resultado || "Pendente"}`,

                    url:
                        "qualidade.html"

                });

            }

        }
    );


    if (!results.length) {

        container.innerHTML = `

            <div class="search-hint">

                <i class="
                    fa-regular
                    fa-face-frown
                "></i>

                <span>
                    Nenhum resultado encontrado.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        results
            .slice(
                0,
                10
            )
            .map(
                result => `

                    <a
                        href="${result.url}"
                        class="search-result"
                    >

                        <div class="
                            search-result-icon
                        ">

                            <i class="
                                fa-solid
                                ${result.icon}
                            "></i>

                        </div>

                        <div class="
                            search-result-content
                        ">

                            <strong>
                                ${escapeHTML(
                                    result.title
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    result.description
                                )}
                            </span>

                        </div>

                    </a>

                `
            )
            .join("");

}


/* =========================================================
   ATALHOS
   ========================================================= */

function setupShortcuts() {

    document
        .querySelectorAll(
            "[data-shortcut]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const url =
                            button.dataset
                                .shortcut;

                        if (url) {
                            window.location.href =
                                url;
                        }

                    }
                );

            }
        );

}


/* =========================================================
   ATUALIZAÇÃO AUTOMÁTICA
   ========================================================= */

function refreshDashboard() {

    updateMetrics();

    updateQualityIndicators();

    renderPendingActions();

    renderNCStatus();

    renderRecentInspections();

    renderNotifications();

    createRevenueChart();

    createProductsChart();

    createQualityChart();

}


/* =========================================================
   LOGOUT
   ========================================================= */

function setupLogout() {

    document
        .querySelectorAll(
            "[data-logout]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const confirmed =
                            window.confirm(
                                "Deseja realmente sair do Atlas Gestão?"
                            );


                        if (!confirmed) {
                            return;
                        }


                        localStorage.removeItem(
                            "atlas_auth"
                        );


                        window.location.href =
                            "index.html";

                    }
                );

            }
        );

}


/* =========================================================
   DETECTAR MUDANÇAS NO LOCALSTORAGE
   ========================================================= */

window.addEventListener(
    "storage",
    event => {

        if (
            Object.values(
                STORAGE_KEYS
            ).includes(
                event.key
            )
        ) {

            refreshDashboard();

        }

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateUserInterface();

        updateDate();

        updateMetrics();

        updateQualityIndicators();

        renderPendingActions();

        renderNCStatus();

        renderRecentInspections();

        renderNotifications();

        setupSidebar();

        setupNotifications();

        setupProfile();

        setupGlobalSearch();

        setupShortcuts();

        setupLogout();

        createRevenueChart();

        createProductsChart();

        createQualityChart();

    }
);


/* =========================================================
   ATUALIZAÇÃO A CADA 30 SEGUNDOS
   ========================================================= */

setInterval(
    () => {

        refreshDashboard();

    },
    30000
);
```
