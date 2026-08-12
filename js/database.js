const AtlasDB = {

    keys: {
        produtos: "atlas_produtos",
        vendas: "atlas_vendas",
        financeiro: "atlas_financeiro",
        equipe: "atlas_equipe",
        inspeções: "atlas_inspecoes",
        auditorias: "atlas_auditorias",
        documentos: "atlas_documentos",
        contatos: "atlas_contatos",
        configuracoes: "atlas_configuracoes"
    },

    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    add(key, item) {
        const data = this.get(key);

        item.id = item.id || Date.now();

        data.push(item);

        this.set(key, data);

        return item;
    },

    update(key, id, changes) {
        const data = this.get(key);

        const index = data.findIndex(
            item => String(item.id) === String(id)
        );

        if (index === -1) return false;

        data[index] = {
            ...data[index],
            ...changes
        };

        this.set(key, data);

        return true;
    },

    remove(key, id) {
        const data = this.get(key);

        const filtered = data.filter(
            item => String(item.id) !== String(id)
        );

        this.set(key, filtered);

        return true;
    },

    clear(key) {
        localStorage.removeItem(key);
    },

    count(key) {
        return this.get(key).length;
    },

    find(key, id) {
        return this.get(key).find(
            item => String(item.id) === String(id)
        );
    }
};

window.AtlasDB = AtlasDB;
