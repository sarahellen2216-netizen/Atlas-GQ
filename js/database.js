/* =========================================================
   ATLAS GESTÃO
   BANCO DE DADOS LOCAL
   js/database.js

   Banco de dados do sistema usando LocalStorage.

   Módulos:
   - Produtos
   - Inspeções
   - Não conformidades
   - Ações corretivas
   - Auditorias
   - Documentos
   - Funcionários
   - Vendas
   - Financeiro
   - Ocorrências
   - Notificações
   - Configurações
   ========================================================= */

const AtlasDB = (() => {

    /* =====================================================
       CONFIGURAÇÃO
       ===================================================== */

    const PREFIX = "atlas_";

    const TABLES = {

        products: "products",

        employees: "employees",

        inspections: "inspections",

        nonConformities: "non_conformities",

        correctiveActions: "corrective_actions",

        audits: "audits",

        documents: "documents",

        sales: "sales",

        financial: "financial",

        occurrences: "occurrences",

        notifications: "notifications",

        settings: "settings",

        contacts: "contacts"

    };


    /* =====================================================
       UTILITÁRIOS
       ===================================================== */

    function storageKey(table) {

        return PREFIX + table;

    }


    function generateId(prefix = "ID") {

        const timestamp =
            Date.now().toString(36);

        const random =
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase();

        return `${prefix}-${timestamp}-${random}`;

    }


    function now() {

        return new Date().toISOString();

    }


    function clone(data) {

        return JSON.parse(
            JSON.stringify(data)
        );

    }


    /* =====================================================
       CRUD BASE
       ===================================================== */

    function getAll(table) {

        try {

            const data =
                localStorage.getItem(
                    storageKey(table)
                );

            if (!data) {

                return [];

            }

            const parsed =
                JSON.parse(data);

            return Array.isArray(parsed)
                ? parsed
                : [];

        } catch (error) {

            console.error(
                `Erro ao carregar ${table}:`,
                error
            );

            return [];

        }

    }


    function saveAll(table, records) {

        try {

            localStorage.setItem(

                storageKey(table),

                JSON.stringify(records)

            );

            return true;

        } catch (error) {

            console.error(
                `Erro ao salvar ${table}:`,
                error
            );

            return false;

        }

    }


    function findById(table, id) {

        const records =
            getAll(table);

        return records.find(
            record =>
                record.id === id
        ) || null;

    }


    function insert(table, data) {

        const records =
            getAll(table);

        const record = {

            id:
                data.id ||
                generateId(
                    table
                        .substring(0, 4)
                        .toUpperCase()
                ),

            ...data,

            createdAt:
                data.createdAt ||
                now(),

            updatedAt:
                now()

        };

        records.push(record);

        saveAll(
            table,
            records
        );

        return clone(record);

    }


    function update(
        table,
        id,
        changes
    ) {

        const records =
            getAll(table);

        const index =
            records.findIndex(
                record =>
                    record.id === id
            );

        if (index === -1) {

            return null;

        }

        records[index] = {

            ...records[index],

            ...changes,

            updatedAt:
                now()

        };

        saveAll(
            table,
            records
        );

        return clone(
            records[index]
        );

    }


    function remove(
        table,
        id
    ) {

        const records =
            getAll(table);

        const filtered =
            records.filter(
                record =>
                    record.id !== id
            );

        if (
            filtered.length ===
            records.length
        ) {

            return false;

        }

        saveAll(
            table,
            filtered
        );

        return true;

    }


    function clear(table) {

        localStorage.removeItem(
            storageKey(table)
        );

    }


    /* =====================================================
       PRODUTOS
       ===================================================== */

    function createProduct(data) {

        return insert(
            TABLES.products,
            {

                code:
                    data.code ||
                    `PROD-${Date.now()}`,

                name:
                    data.name || "",

                category:
                    data.category || "",

                stock:
                    Number(
                        data.stock || 0
                    ),

                minimumStock:
                    Number(
                        data.minimumStock || 0
                    ),

                price:
                    Number(
                        data.price || 0
                    ),

                supplier:
                    data.supplier || "",

                status:
                    data.status ||
                    "Ativo"

            }
        );

    }


    function getProducts() {

        return getAll(
            TABLES.products
        );

    }


    function updateProduct(
        id,
        data
    ) {

        return update(
            TABLES.products,
            id,
            data
        );

    }


    function deleteProduct(id) {

        return remove(
            TABLES.products,
            id
        );

    }


    /* =====================================================
       FUNCIONÁRIOS
       ===================================================== */

    function createEmployee(data) {

        return insert(
            TABLES.employees,
            {

                name:
                    data.name || "",

                position:
                    data.position || "",

                department:
                    data.department || "",

                phone:
                    data.phone || "",

                email:
                    data.email || "",

                status:
                    data.status ||
                    "Ativo",

                admissionDate:
                    data.admissionDate ||
                    ""

            }
        );

    }


    function getEmployees() {

        return getAll(
            TABLES.employees
        );

    }


    function updateEmployee(
        id,
        data
    ) {

        return update(
            TABLES.employees,
            id,
            data
        );

    }


    function deleteEmployee(id) {

        return remove(
            TABLES.employees,
            id
        );

    }


    /* =====================================================
       INSPEÇÕES DE QUALIDADE
       ===================================================== */

    function createInspection(data) {

        const result =
            data.result ||
            data.status ||
            "Conforme";

        const inspection =
            insert(
                TABLES.inspections,
                {

                    productId:
                        data.productId ||
                        "",

                    productName:
                        data.productName ||
                        "",

                    responsible:
                        data.responsible ||
                        "",

                    date:
                        data.date ||
                        new Date()
                            .toISOString()
                            .substring(
                                0,
                                10
                            ),

                    type:
                        data.type ||
                        "Inspeção de Produto",

                    lot:
                        data.lot ||
                        "",

                    result,

                    description:
                        data.description ||
                        "",

                    correctiveAction:
                        data.correctiveAction ||
                        "",

                    status:
                        data.status ||
                        (
                            result ===
                            "Conforme"
                                ? "Concluída"
                                : "Pendente"
                        )

                }
            );


        /*
         * Se a inspeção for não conforme,
         * cria automaticamente uma ocorrência.
         */

        if (
            result ===
                "Não Conforme"
        ) {

            createOccurrence({

                type:
                    "Não Conformidade",

                title:
                    `Não conformidade - ${inspection.productName}`,

                description:
                    inspection.description,

                referenceId:
                    inspection.id,

                priority:
                    "Alta",

                status:
                    "Aberta"

            });

        }


        return inspection;

    }


    function getInspections() {

        return getAll(
            TABLES.inspections
        );

    }


    function updateInspection(
        id,
        data
    ) {

        return update(
            TABLES.inspections,
            id,
            data
        );

    }


    function deleteInspection(id) {

        return remove(
            TABLES.inspections,
            id
        );

    }


    /* =====================================================
       NÃO CONFORMIDADES
       ===================================================== */

    function createNonConformity(data) {

        return insert(
            TABLES.nonConformities,
            {

                number:
                    data.number ||
                    `NC-${String(
                        getAll(
                            TABLES
                                .nonConformities
                        ).length + 1
                    ).padStart(
                        4,
                        "0"
                    )}`,

                title:
                    data.title || "",

                product:
                    data.product || "",

                sector:
                    data.sector || "",

                responsible:
                    data.responsible ||
                    "",

                date:
                    data.date ||
                    new Date()
                        .toISOString()
                        .substring(
                            0,
                            10
                        ),

                description:
                    data.description ||
                    "",

                cause:
                    data.cause || "",

                correctiveAction:
                    data.correctiveAction ||
                    "",

                priority:
                    data.priority ||
                    "Média",

                status:
                    data.status ||
                    "Aberta",

                deadline:
                    data.deadline ||
                    ""

            }
        );

    }


    function getNonConformities() {

        return getAll(
            TABLES.nonConformities
        );

    }


    function updateNonConformity(
        id,
        data
    ) {

        return update(
            TABLES.nonConformities,
            id,
            data
        );

    }


    function deleteNonConformity(
        id
    ) {

        return remove(
            TABLES.nonConformities,
            id
        );

    }


    /* =====================================================
       AÇÕES CORRETIVAS
       ===================================================== */

    function createCorrectiveAction(
        data
    ) {

        return insert(
            TABLES.correctiveActions,
            {

                number:
                    data.number ||
                    `AC-${String(
                        getAll(
                            TABLES
                                .correctiveActions
                        ).length + 1
                    ).padStart(
                        4,
                        "0"
                    )}`,

                title:
                    data.title || "",

                description:
                    data.description ||
                    "",

                responsible:
                    data.responsible ||
                    "",

                origin:
                    data.origin ||
                    "Não Conformidade",

                originId:
                    data.originId ||
                    "",

                priority:
                    data.priority ||
                    "Média",

                status:
                    data.status ||
                    "Pendente",

                startDate:
                    data.startDate ||
                    new Date()
                        .toISOString()
                        .substring(
                            0,
                            10
                        ),

                deadline:
                    data.deadline ||
                    "",

                completionDate:
                    data.completionDate ||
                    "",

                effectiveness:
                    data.effectiveness ||
                    "Não avaliada"

            }
        );

    }


    function getCorrectiveActions() {

        return getAll(
            TABLES.correctiveActions
        );

    }


    function updateCorrectiveAction(
        id,
        data
    ) {

        return update(
            TABLES.correctiveActions,
            id,
            data
        );

    }


    function deleteCorrectiveAction(
        id
    ) {

        return remove(
            TABLES.correctiveActions,
            id
        );

    }


    /* =====================================================
       AUDITORIAS
       ===================================================== */

    function createAudit(data) {

        return insert(
            TABLES.audits,
            {

                number:
                    data.number ||
                    `AUD-${String(
                        getAll(
                            TABLES.audits
                        ).length + 1
                    ).padStart(
                        4,
                        "0"
                    )}`,

                title:
                    data.title || "",

                type:
                    data.type ||
                    "Auditoria Interna",

                area:
                    data.area || "",

                auditor:
                    data.auditor || "",

                date:
                    data.date || "",

                deadline:
                    data.deadline || "",

                status:
                    data.status ||
                    "Planejada",

                result:
                    data.result ||
                    "",

                findings:
                    data.findings ||
                    "",

                observations:
                    data.observations ||
                    ""

            }
        );

    }


    function getAudits() {

        return getAll(
            TABLES.audits
        );

    }


    function updateAudit(
        id,
        data
    ) {

        return update(
            TABLES.audits,
            id,
            data
        );

    }


    function deleteAudit(id) {

        return remove(
            TABLES.audits,
            id
        );

    }


    /* =====================================================
       DOCUMENTOS
       ===================================================== */

    function createDocument(data) {

        return insert(
            TABLES.documents,
            {

                code:
                    data.code ||
                    `DOC-${String(
                        getAll(
                            TABLES.documents
                        ).length + 1
                    ).padStart(
                        4,
                        "0"
                    )}`,

                name:
                    data.name || "",

                category:
                    data.category ||
                    "Procedimento",

                version:
                    data.version ||
                    "1.0",

                responsible:
                    data.responsible ||
                    "",

                status:
                    data.status ||
                    "Vigente",

                reviewDate:
                    data.reviewDate ||
                    "",

                description:
                    data.description ||
                    ""

            }
        );

    }


    function getDocuments() {

        return getAll(
            TABLES.documents
        );

    }


    function updateDocument(
        id,
        data
    ) {

        return update(
            TABLES.documents,
            id,
            data
        );

    }


    function deleteDocument(id) {

        return remove(
            TABLES.documents,
            id
        );

    }


    /* =====================================================
       VENDAS
       ===================================================== */

    function createSale(data) {

        const quantity =
            Number(
                data.quantity || 1
            );

        const unitPrice =
            Number(
                data.unitPrice ||
                data.value ||
                0
            );

        return insert(
            TABLES.sales,
            {

                customer:
                    data.customer || "",

                productId:
                    data.productId ||
                    "",

                product:
                    data.product || "",

                quantity,

                unitPrice,

                total:
                    quantity *
                    unitPrice,

                paymentMethod:
                    data.paymentMethod ||
                    "Não informado",

                date:
                    data.date ||
                    new Date()
                        .toISOString()
                        .substring(
                            0,
                            10
                        )

            }
        );

    }


    function getSales() {

        return getAll(
            TABLES.sales
        );

    }


    function deleteSale(id) {

        return remove(
            TABLES.sales,
            id
        );

    }


    /* =====================================================
       FINANCEIRO
       ===================================================== */

    function createFinancialEntry(
        data
    ) {

        return insert(
            TABLES.financial,
            {

                type:
                    data.type ||
                    "Receita",

                category:
                    data.category ||
                    "Outros",

                value:
                    Number(
                        data.value || 0
                    ),

                description:
                    data.description ||
                    "",

                date:
                    data.date ||
                    new Date()
                        .toISOString()
                        .substring(
                            0,
                            10
                        )

            }
        );

    }


    function getFinancialEntries() {

        return getAll(
            TABLES.financial
        );

    }


    function deleteFinancialEntry(
        id
    ) {

        return remove(
            TABLES.financial,
            id
        );

    }


    /* =====================================================
       OCORRÊNCIAS
       ===================================================== */

    function createOccurrence(data) {

        return insert(
            TABLES.occurrences,
            {

                type:
                    data.type ||
                    "Ocorrência",

                title:
                    data.title || "",

                description:
                    data.description ||
                    "",

                referenceId:
                    data.referenceId ||
                    "",

                priority:
                    data.priority ||
                    "Média",

                status:
                    data.status ||
                    "Aberta",

                responsible:
                    data.responsible ||
                    "",

                dueDate:
                    data.dueDate ||
                    ""

            }
        );

    }


    function getOccurrences() {

        return getAll(
            TABLES.occurrences
        );

    }


    function updateOccurrence(
        id,
        data
    ) {

        return update(
            TABLES.occurrences,
            id,
            data
        );

    }


    function deleteOccurrence(id) {

        return remove(
            TABLES.occurrences,
            id
        );

    }


    /* =====================================================
       NOTIFICAÇÕES
       ===================================================== */

    function createNotification(
        data
    ) {

        return insert(
            TABLES.notifications,
            {

                title:
                    data.title || "",

                message:
                    data.message || "",

                type:
                    data.type ||
                    "info",

                read:
                    Boolean(
                        data.read
                    ),

                link:
                    data.link || "",

                date:
                    data.date ||
                    now()

            }
        );

    }


    function getNotifications() {

        return getAll(
            TABLES.notifications
        );

    }


    function markNotificationAsRead(
        id
    ) {

        return update(
            TABLES.notifications,
            id,
            {
                read: true
            }
        );

    }


    function markAllNotificationsAsRead() {

        const notifications =
            getNotifications();


        notifications.forEach(
            notification => {

                notification.read =
                    true;

                notification.updatedAt =
                    now();

            }
        );


        saveAll(
            TABLES.notifications,
            notifications
        );

    }


    function deleteNotification(id) {

        return remove(
            TABLES.notifications,
            id
        );

    }


    /* =====================================================
       CONTATO
       ===================================================== */

    function createContact(data) {

        return insert(
            TABLES.contacts,
            {

                name:
                    data.name || "",

                email:
                    data.email || "",

                subject:
                    data.subject || "",

                message:
                    data.message || "",

                status:
                    data.status ||
                    "Novo"

            }
        );

    }


    function getContacts() {

        return getAll(
            TABLES.contacts
        );

    }


    function updateContact(
        id,
        data
    ) {

        return update(
            TABLES.contacts,
            id,
            data
        );

    }


    function deleteContact(id) {

        return remove(
            TABLES.contacts,
            id
        );

    }


    /* =====================================================
       CONFIGURAÇÕES DA EMPRESA
       ===================================================== */

    function getSettings() {

        try {

            const data =
                localStorage.getItem(
                    storageKey(
                        TABLES.settings
                    )
                );

            if (!data) {

                return {

                    companyName:
                        "Atlas Gestão",

                    slogan:
                        "Gestão inteligente para empresas modernas.",

                    cnpj:
                        "",

                    email:
                        "",

                    phone:
                        "",

                    address:
                        "",

                    city:
                        "",

                    state:
                        "",

                    theme:
                        "light",

                    notifications:
                        true

                };

            }

            return JSON.parse(data);

        } catch (error) {

            console.error(
                "Erro ao carregar configurações:",
                error
            );

            return {};

        }

    }


    function saveSettings(data) {

        const current =
            getSettings();


        const settings = {

            ...current,

            ...data,

            updatedAt:
                now()

        };


        localStorage.setItem(

            storageKey(
                TABLES.settings
            ),

            JSON.stringify(
                settings
            )

        );


        return clone(
            settings
        );

    }


    /* =====================================================
       INDICADORES DE QUALIDADE
       ===================================================== */

    function getQualityIndicators() {

        const inspections =
            getInspections();

        const nonConformities =
            getNonConformities();

        const correctiveActions =
            getCorrectiveActions();

        const audits =
            getAudits();


        const totalInspections =
            inspections.length;


        const conforming =
            inspections.filter(
                inspection =>
                    inspection.result ===
                    "Conforme"
            ).length;


        const nonConforming =
            inspections.filter(
                inspection =>
                    inspection.result ===
                    "Não Conforme"
            ).length;


        const conformityRate =
            totalInspections > 0
                ? (
                    conforming /
                    totalInspections
                ) * 100
                : 0;


        const openNC =
            nonConformities.filter(
                nc =>
                    nc.status !==
                    "Concluída"
                    &&
                    nc.status !==
                    "Encerrada"
            ).length;


        const pendingActions =
            correctiveActions.filter(
                action =>
                    action.status !==
                    "Concluída"
                    &&
                    action.status !==
                    "Encerrada"
            ).length;


        const overdueActions =
            correctiveActions.filter(
                action => {

                    if (
                        !action.deadline
                    ) {

                        return false;

                    }

                    if (
                        action.status ===
                        "Concluída"
                    ) {

                        return false;

                    }

                    return (
                        new Date(
                            action.deadline
                        ) <
                        new Date()
                    );

                }
            ).length;


        const completedAudits =
            audits.filter(
                audit =>
                    audit.status ===
                    "Concluída"
            ).length;


        return {

            totalInspections,

            conforming,

            nonConforming,

            conformityRate:
                Number(
                    conformityRate.toFixed(
                        2
                    )
                ),

            totalNonConformities:
                nonConformities.length,

            openNC,

            pendingActions,

            overdueActions,

            totalAudits:
                audits.length,

            completedAudits

        };

    }


    /* =====================================================
       INDICADORES GERAIS
       ===================================================== */

    function getGeneralIndicators() {

        const products =
            getProducts();

        const employees =
            getEmployees();

        const sales =
            getSales();

        const financial =
            getFinancialEntries();


        const revenue =
            financial
                .filter(
                    entry =>
                        entry.type ===
                        "Receita"
                )
                .reduce(
                    (
                        total,
                        entry
                    ) =>
                        total +
                        Number(
                            entry.value
                        ),
                    0
                );


        const expenses =
            financial
                .filter(
                    entry =>
                        entry.type ===
                        "Despesa"
                )
                .reduce(
                    (
                        total,
                        entry
                    ) =>
                        total +
                        Number(
                            entry.value
                        ),
                    0
                );


        return {

            totalProducts:
                products.length,

            totalEmployees:
                employees.length,

            totalSales:
                sales.length,

            revenue,

            expenses,

            profit:
                revenue -
                expenses

        };

    }


    /* =====================================================
       ESTOQUE BAIXO
       ===================================================== */

    function getLowStockProducts() {

        return getProducts()
            .filter(
                product =>
                    Number(
                        product.stock
                    ) <=
                    Number(
                        product.minimumStock
                    )
            );

    }


    /* =====================================================
       CRIAR NOTIFICAÇÕES AUTOMÁTICAS
       ===================================================== */

    function generateAutomaticNotifications() {

        const lowStock =
            getLowStockProducts();


        lowStock.forEach(
            product => {

                const existing =
                    getNotifications()
                        .find(
                            notification =>
                                notification
                                    .referenceId ===
                                product.id
                        );


                if (!existing) {

                    createNotification({

                        title:
                            "Estoque baixo",

                        message:
                            `O produto ${product.name} está com estoque abaixo do mínimo.`,

                        type:
                            "warning",

                        link:
                            "produtos.html",

                        referenceId:
                            product.id

                    });

                }

            }
        );


        const quality =
            getQualityIndicators();


        if (
            quality.openNC > 0
        ) {

            const existing =
                getNotifications()
                    .find(
                        notification =>
                            notification
                                .type ===
                            "quality"
                    );


            if (!existing) {

                createNotification({

                    title:
                        "Não conformidades pendentes",

                    message:
                        `Existem ${quality.openNC} não conformidade(s) em aberto.`,

                    type:
                        "quality",

                    link:
                        "qualidade.html"

                });

            }

        }


        return getNotifications();

    }


    /* =====================================================
       DADOS DEMONSTRATIVOS
       ===================================================== */

    function seedDemoData() {

        /*
         * Só cria os dados caso o banco
         * ainda esteja vazio.
         */

        if (
            getProducts().length === 0
        ) {

            createProduct({

                code:
                    "PRD-001",

                name:
                    "Produto A",

                category:
                    "Matéria-prima",

                stock:
                    150,

                minimumStock:
                    50,

                price:
                    125.90,

                supplier:
                    "Fornecedor Alfa"

            });


            createProduct({

                code:
                    "PRD-002",

                name:
                    "Produto B",

                category:
                    "Produto acabado",

                stock:
                    32,

                minimumStock:
                    40,

                price:
                    89.90,

                supplier:
                    "Fornecedor Beta"

            });


            createProduct({

                code:
                    "PRD-003",

                name:
                    "Produto C",

                category:
                    "Embalagem",

                stock:
                    500,

                minimumStock:
                    100,

                price:
                    25.50,

                supplier:
                    "Fornecedor Gama"

            });

        }


        if (
            getEmployees().length === 0
        ) {

            createEmployee({

                name:
                    "Ana Carolina",

                position:
                    "Analista da Qualidade",

                department:
                    "Garantia da Qualidade",

                phone:
                    "(47) 99999-0001",

                email:
                    "ana@atlasgestao.com",

                status:
                    "Ativo"

            });


            createEmployee({

                name:
                    "Carlos Mendes",

                position:
                    "Supervisor",

                department:
                    "Produção",

                phone:
                    "(47) 99999-0002",

                email:
                    "carlos@atlasgestao.com",

                status:
                    "Ativo"

            });

        }


        if (
            getInspections().length === 0
        ) {

            createInspection({

                productName:
                    "Produto A",

                responsible:
                    "Ana Carolina",

                date:
                    "2026-08-05",

                type:
                    "Inspeção de recebimento",

                lot:
                    "LOT-001",

                result:
                    "Conforme",

                description:
                    "Produto aprovado nos critérios de inspeção.",

                status:
                    "Concluída"

            });


            createInspection({

                productName:
                    "Produto B",

                responsible:
                    "Ana Carolina",

                date:
                    "2026-08-07",

                type:
                    "Inspeção final",

                lot:
                    "LOT-002",

                result:
                    "Não Conforme",

                description:
                    "Foi identificada divergência no acabamento do produto.",

                correctiveAction:
                    "Realizar análise da causa e retrabalho do lote.",

                status:
                    "Pendente"

            });


            createInspection({

                productName:
                    "Produto C",

                responsible:
                    "Carlos Mendes",

                date:
                    "2026-08-08",

                type:
                    "Inspeção de processo",

                lot:
                    "LOT-003",

                result:
                    "Conforme",

                description:
                    "Processo dentro dos parâmetros estabelecidos.",

                status:
                    "Concluída"

            });

        }


        if (
            getNonConformities().length === 0
        ) {

            createNonConformity({

                title:
                    "Divergência no acabamento",

                product:
                    "Produto B",

                sector:
                    "Produção",

                responsible:
                    "Carlos Mendes",

                date:
                    "2026-08-07",

                description:
                    "Acabamento fora do padrão estabelecido.",

                cause:
                    "Parâmetro de produção inadequado.",

                correctiveAction:
                    "Revisar parâmetros e realizar retrabalho.",

                priority:
                    "Alta",

                status:
                    "Aberta",

                deadline:
                    "2026-08-15"

            });

        }


        if (
            getCorrectiveActions().length === 0
        ) {

            createCorrectiveAction({

                title:
                    "Revisão do processo de acabamento",

                description:
                    "Revisar os parâmetros utilizados no processo.",

                responsible:
                    "Carlos Mendes",

                origin:
                    "Não Conformidade",

                priority:
                    "Alta",

                status:
                    "Em andamento",

                startDate:
                    "2026-08-08",

                deadline:
                    "2026-08-15"

            });

        }


        if (
            getAudits().length === 0
        ) {

            createAudit({

                title:
                    "Auditoria interna da qualidade",

                type:
                    "Auditoria Interna",

                area:
                    "Produção",

                auditor:
                    "Ana Carolina",

                date:
                    "2026-08-20",

                deadline:
                    "2026-08-22",

                status:
                    "Planejada"

            });

        }


        if (
            getDocuments().length === 0
        ) {

            createDocument({

                name:
                    "Procedimento de Inspeção de Produto",

                category:
                    "Procedimento",

                version:
                    "1.0",

                responsible:
                    "Ana Carolina",

                status:
                    "Vigente",

                reviewDate:
                    "2027-01-10",

                description:
                    "Procedimento padrão para inspeção de produtos."

            });


            createDocument({

                name:
                    "Manual da Garantia da Qualidade",

                category:
                    "Manual",

                version:
                    "2.0",

                responsible:
                    "Gestão da Qualidade",

                status:
                    "Vigente",

                reviewDate:
                    "2027-02-15",

                description:
                    "Manual geral do sistema de gestão da qualidade."

            });

        }


        if (
            getFinancialEntries().length === 0
        ) {

            createFinancialEntry({

                type:
                    "Receita",

                category:
                    "Vendas",

                value:
                    18500,

                description:
                    "Receita de vendas",

                date:
                    "2026-08-05"

            });


            createFinancialEntry({

                type:
                    "Despesa",

                category:
                    "Operacional",

                value:
                    6200,

                description:
                    "Despesas operacionais",

                date:
                    "2026-08-06"

            });

        }


        if (
            getSales().length === 0
        ) {

            createSale({

                customer:
                    "Cliente Alpha",

                product:
                    "Produto A",

                quantity:
                    10,

                unitPrice:
                    125.90,

                paymentMethod:
                    "PIX",

                date:
                    "2026-08-05"

            });


            createSale({

                customer:
                    "Cliente Beta",

                product:
                    "Produto B",

                quantity:
                    8,

                unitPrice:
                    89.90,

                paymentMethod:
                    "Cartão",

                date:
                    "2026-08-07"

            });

        }


        generateAutomaticNotifications();

    }


    /* =====================================================
       EXPORTAÇÃO DE DADOS
       ===================================================== */

    function exportDatabase() {

        const database = {};


        Object.keys(TABLES)
            .forEach(
                key => {

                    database[key] =
                        getAll(
                            TABLES[key]
                        );

                }
            );


        database.settings =
            getSettings();


        return database;

    }


    /* =====================================================
       IMPORTAÇÃO DE DADOS
       ===================================================== */

    function importDatabase(
        database
    ) {

        if (
            !database ||
            typeof database !==
                "object"
        ) {

            return {

                success: false,

                message:
                    "Dados inválidos."

            };

        }


        try {

            Object.keys(TABLES)
                .forEach(
                    key => {

                        if (
                            Array.isArray(
                                database[key]
                            )
                        ) {

                            saveAll(

                                TABLES[key],

                                database[key]

                            );

                        }

                    }
                );


            if (
                database.settings
            ) {

                saveSettings(
                    database.settings
                );

            }


            return {

                success: true,

                message:
                    "Banco de dados importado com sucesso."

            };

        } catch (error) {

            console.error(error);

            return {

                success: false,

                message:
                    "Erro ao importar os dados."

            };

        }

    }


    /* =====================================================
       RESETAR BANCO
       ===================================================== */

    function resetDatabase() {

        Object.values(TABLES)
            .forEach(
                table => {

                    localStorage.removeItem(
                        storageKey(table)
                    );

                }
            );


        seedDemoData();


        return true;

    }


    /* =====================================================
       ESTATÍSTICAS DO BANCO
       ===================================================== */

    function getDatabaseStats() {

        const stats = {};


        Object.entries(TABLES)
            .forEach(
                ([key, table]) => {

                    stats[key] =
                        getAll(table)
                            .length;

                }
            );


        return stats;

    }


    /* =====================================================
       INICIALIZAÇÃO
       ===================================================== */

    function initialize() {

        /*
         * Garante que as configurações
         * existam.
         */

        if (
            !localStorage.getItem(
                storageKey(
                    TABLES.settings
                )
            )
        ) {

            saveSettings({

                companyName:
                    "Atlas Gestão",

                slogan:
                    "Gestão inteligente para empresas modernas.",

                theme:
                    "light",

                notifications:
                    true

            });

        }


        /*
         * Dados demonstrativos.
         */

        seedDemoData();

    }


    /* =====================================================
       API PÚBLICA
       ===================================================== */

    return {

        TABLES,

        getAll,

        saveAll,

        findById,

        insert,

        update,

        remove,

        clear,

        generateId,

        initialize,

        resetDatabase,

        exportDatabase,

        importDatabase,

        getDatabaseStats,

        createProduct,

        getProducts,

        updateProduct,

        deleteProduct,

        createEmployee,

        getEmployees,

        updateEmployee,

        deleteEmployee,

        createInspection,

        getInspections,

        updateInspection,

        deleteInspection,

        createNonConformity,

        getNonConformities,

        updateNonConformity,

        deleteNonConformity,

        createCorrectiveAction,

        getCorrectiveActions,

        updateCorrectiveAction,

        deleteCorrectiveAction,

        createAudit,

        getAudits,

        updateAudit,

        deleteAudit,

        createDocument,

        getDocuments,

        updateDocument,

        deleteDocument,

        createSale,

        getSales,

        deleteSale,

        createFinancialEntry,

        getFinancialEntries,

        deleteFinancialEntry,

        createOccurrence,

        getOccurrences,

        updateOccurrence,

        deleteOccurrence,

        createNotification,

        getNotifications,

        markNotificationAsRead,

        markAllNotificationsAsRead,

        deleteNotification,

        createContact,

        getContacts,

        updateContact,

        deleteContact,

        getSettings,

        saveSettings,

        getQualityIndicators,

        getGeneralIndicators,

        getLowStockProducts,

        generateAutomaticNotifications

    };

})();


/* =========================================================
   DISPONIBILIZAR GLOBALMENTE
   ========================================================= */

window.AtlasDB = AtlasDB;


/* =========================================================
   INICIALIZAR BANCO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AtlasDB.initialize();

        console.log(
            "Atlas Gestão: banco de dados inicializado."
        );

        console.log(
            "Atlas Gestão: estatísticas:",
            AtlasDB.getDatabaseStats()
        );

    }
);
