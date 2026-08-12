document.addEventListener(
    "DOMContentLoaded",
    loadDashboard
);


function money(value) {

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


function loadDashboard() {

    const produtos =
        AtlasDB.get("produtos");

    const equipe =
        AtlasDB.get("equipe");

    const vendas =
        AtlasDB.get("vendas");

    const financeiro =
        AtlasDB.get("financeiro");

    const inspecoes =
        AtlasDB.get("inspecoes");

    const documentos =
        AtlasDB.get("documentos");


    setText(
        "totalProdutos",
        produtos.length
    );

    setText(
        "totalEquipe",
        equipe.length
    );

    setText(
        "totalVendas",
        vendas.length
    );

    setText(
        "totalDocumentos",
        documentos.length
    );


    const conformes =
        inspecoes.filter(
            item =>
                item.resultado ===
                "Conforme"
        ).length;


    const naoConformes =
        inspecoes.filter(
            item =>
                item.resultado ===
                "Não Conforme"
        ).length;


    const taxa =
        inspecoes.length
            ? Math.round(
                conformes /
                inspecoes.length *
                100
            )
            : 0;


    setText(
        "taxaConformidade",
        taxa + "%"
    );


    setText(
        "naoConformidades",
        naoConformes
    );


    const receitas =
        financeiro
            .filter(
                item =>
                    item.tipo ===
                    "Receita"
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.valor || 0
                    ),
                0
            );


    const despesas =
        financeiro
            .filter(
                item =>
                    item.tipo ===
                    "Despesa"
            )
            .reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    Number(
                        item.valor || 0
                    ),
                0
            );


    setText(
        "receitaTotal",
        money(receitas)
    );

    setText(
        "despesaTotal",
        money(despesas)
    );


    renderQuality(
        conformes,
        naoConformes,
        inspecoes.length
    );

}


function renderQuality(
    conformes,
    naoConformes,
    total
) {

    const element =
        document.getElementById(
            "qualitySummary"
        );

    if (!element) {
        return;
    }


    if (!total) {

        element.innerHTML = `

            <div class="empty-state">

                <div
                    style="
                    font-size:40px;
                    margin-bottom:10px;
                    "
                >
                    🛡️
                </div>

                <strong>
                    Nenhuma inspeção registrada
                </strong>

                <p>
                    Cadastre uma inspeção para visualizar
                    os indicadores de qualidade.
                </p>

            </div>

        `;

        return;
    }


    const taxa =
        Math.round(
            conformes /
            total *
            100
        );


    element.innerHTML = `

        <div
            style="
            text-align:center;
            padding:20px;
            "
        >

            <div
                style="
                font-size:48px;
                font-weight:700;
                color:#2563eb;
                "
            >
                ${taxa}%
            </div>

            <p>
                Taxa de conformidade
            </p>

            <div
                style="
                display:flex;
                justify-content:center;
                gap:25px;
                margin-top:25px;
                "
            >

                <span>
                    ✓ Conforme:
                    <strong>
                        ${conformes}
                    </strong>
                </span>

                <span>
                    ⚠ Não conforme:
                    <strong>
                        ${naoConformes}
                    </strong>
                </span>

            </div>

        </div>

    `;
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
