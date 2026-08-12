/* =====================================================
   ATLAS GESTÃO
   BANCO DE DADOS LOCAL
===================================================== */

const AtlasDB = {

    prefix: "atlas_",

    get(key) {

        try {

            const value =
                localStorage.getItem(
                    this.prefix + key
                );

            if (!value) {
                return [];
            }

            return JSON.parse(value);

        } catch (error) {

            console.error(
                "Erro ao ler banco:",
                error
            );

            return [];
        }
    },


    set(key, data) {

        try {

            localStorage.setItem(
                this.prefix + key,
                JSON.stringify(data)
            );

            return true;

        } catch (error) {

            console.error(
                "Erro ao salvar banco:",
                error
            );

            return false;
        }
    },


    add(key, item) {

        const data = this.get(key);

        const newItem = {

            id:
                item.id ||
                Date.now() +
                Math.floor(
                    Math.random() * 1000
                ),

            createdAt:
                item.createdAt ||
                new Date().toISOString(),

            ...item
        };

        data.push(newItem);

        this.set(key, data);

        return newItem;
    },


    update(key, id, changes) {

        const data = this.get(key);

        const index =
            data.findIndex(
                item =>
                    String(item.id) ===
                    String(id)
            );

        if (index === -1) {
            return false;
        }

        data[index] = {

            ...data[index],

            ...changes,

            updatedAt:
                new Date().toISOString()
        };

        this.set(key, data);

        return data[index];
    },


    remove(key, id) {

        const data = this.get(key);

        const filtered =
            data.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );

        this.set(key, filtered);

        return true;
    },


    clear(key) {

        localStorage.removeItem(
            this.prefix + key
        );
    },


    count(key) {

        return this.get(key).length;
    },


    seed() {

        const collections = [
            "produtos",
            "vendas",
            "financeiro",
            "equipe",
            "inspecoes",
            "auditorias",
            "documentos",
            "contatos"
        ];

        collections.forEach(key => {

            if (
                localStorage.getItem(
                    this.prefix + key
                ) === null
            ) {

                this.set(key, []);

            }

        });

    }

};


/* Inicialização */

AtlasDB.seed();


/* Compatibilidade */

window.AtlasDB = AtlasDB;
