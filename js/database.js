/* =========================================================
   ATLAS GESTÃO
   Banco de dados local - LocalStorage
   ========================================================= */

(function () {
    "use strict";

    const DB_KEY = "atlas_gestao_database_v3";

    const defaultDatabase = {
        products: [],
        finances: [],
        sales: [],
        team: [],
        inspections: [],
        audits: [],
        documents: [],
        messages: [],

        settings: {
            company: {
                name: "Atlas Gestão",
                cnpj: "",
                email: "contato@atlasgestao.com",
                phone: "(11) 4000-0000",
                address: "São Paulo - SP"
            },

            user: {
                name: "Administrador",
                email: "admin@atlasgestao.com",
                role: "Administrador"
            },

            theme: "light",

            preferences: {
                notifications: true,
                stockAlerts: true,
                qualityAlerts: true
            }
        }
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function load() {
        try {
            const saved = localStorage.getItem(DB_KEY);

            if (!saved) {
                localStorage.setItem(DB_KEY, JSON.stringify(defaultDatabase));
                return clone(defaultDatabase);
            }

            const parsed = JSON.parse(saved);

            return {
                ...clone(defaultDatabase),
                ...parsed,
                settings: {
                    ...clone(defaultDatabase.settings),
                    ...(parsed.settings || {}),
                    company: {
                        ...clone(defaultDatabase.settings.company),
                        ...(parsed.settings?.company || {})
                    },
                    user: {
                        ...clone(defaultDatabase.settings.user),
                        ...(parsed.settings?.user || {})
                    },
                    preferences: {
                        ...clone(defaultDatabase.settings.preferences),
                        ...(parsed.settings?.preferences || {})
                    }
                }
            };
        } catch (error) {
            console.error("Erro ao carregar banco:", error);
            return clone(defaultDatabase);
        }
    }

    function save(database) {
        localStorage.setItem(DB_KEY, JSON.stringify(database));
        window.dispatchEvent(new CustomEvent("atlas:database-updated"));
    }

    function get(collection) {
        const database = load();
        return database[collection] || [];
    }

    function set(collection, value) {
        const database = load();
        database[collection] = value;
        save(database);
        return value;
    }

    function add(collection, item) {
        const database = load();

        const newItem = {
            id: item.id || crypto.randomUUID(),
            createdAt: item.createdAt || new Date().toISOString(),
            ...item
        };

        if (!Array.isArray(database[collection])) {
            database[collection] = [];
        }

        database[collection].push(newItem);
        save(database);

        return newItem;
    }

    function update(collection, id, changes) {
        const database = load();

        const index = database[collection].findIndex(
            item => String(item.id) === String(id)
        );

        if (index === -1) return null;

        database[collection][index] = {
            ...database[collection][index],
            ...changes,
            updatedAt: new Date().toISOString()
        };

        save(database);

        return database[collection][index];
    }

    function remove(collection, id) {
        const database = load();

        database[collection] = database[collection].filter(
            item => String(item.id) !== String(id)
        );

        save(database);
    }

    function clearAll() {
        localStorage.removeItem(DB_KEY);
        localStorage.removeItem("atlas_logged");
        location.reload();
    }

    function getSettings() {
        return load().settings;
    }

    function saveSettings(settings) {
        const database = load();

        database.settings = {
            ...database.settings,
            ...settings
        };

        save(database);
        return database.settings;
    }

    window.AtlasDB = {
        load,
        save,
        get,
        set,
        add,
        update,
        remove,
        clearAll,
        getSettings,
        saveSettings,
        key: DB_KEY
    };
})();
