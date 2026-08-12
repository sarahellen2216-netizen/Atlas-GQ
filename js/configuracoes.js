/* ==========================================
   ATLAS GESTÃO
   CONFIGURAÇÕES
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {


    /* ==========================================
       MENU MOBILE
       ========================================== */

    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");

    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });

    }


    /* ==========================================
       NAVEGAÇÃO DAS CONFIGURAÇÕES
       ========================================== */

    const menuItems =
        document.querySelectorAll(".settings-menu-item");

    const sections =
        document.querySelectorAll(".settings-section");


    menuItems.forEach(function (item) {

        item.addEventListener("click", function () {

            const target =
                item.getAttribute("data-section");


            menuItems.forEach(function (menu) {

                menu.classList.remove("active");

            });


            sections.forEach(function (section) {

                section.classList.remove("active");

            });


            item.classList.add("active");


            const targetSection =
                document.getElementById(
                    "section-" + target
                );


            if (targetSection) {

                targetSection.classList.add("active");

            }

        });

    });


    /* ==========================================
       DADOS DA EMPRESA
       ========================================== */

    const companyForm =
        document.getElementById("companyForm");


    function carregarEmpresa() {

        const empresa =
            JSON.parse(
                localStorage.getItem("atlasEmpresa")
            );


        if (!empresa) {
            return;
        }


        const fields = {

            companyName: empresa.nome,
            companyCnpj: empresa.cnpj,
            companyEmail: empresa.email,
            companyPhone: empresa.telefone,
            companyAddress: empresa.endereco

        };


        Object.keys(fields).forEach(function (id) {

            const field =
                document.getElementById(id);


            if (field && fields[id]) {

                field.value = fields[id];

            }

        });

    }


    carregarEmpresa();


    if (companyForm) {

        companyForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const empresa = {

                nome:
                    document.getElementById("companyName").value.trim(),

                cnpj:
                    document.getElementById("companyCnpj").value.trim(),

                email:
                    document.getElementById("companyEmail").value.trim(),

                telefone:
                    document.getElementById("companyPhone").value.trim(),

                endereco:
                    document.getElementById("companyAddress").value.trim()

            };


            localStorage.setItem(
                "atlasEmpresa",
                JSON.stringify(empresa)
            );


            alert("Dados da empresa salvos com sucesso.");

        });

    }


    /* ==========================================
       PERFIL
       ========================================== */

    const profileForm =
        document.getElementById("profileForm");


    function carregarPerfil() {

        const perfil =
            JSON.parse(
                localStorage.getItem("atlasPerfil")
            );


        if (!perfil) {
            return;
        }


        const name =
            document.getElementById("profileName");

        const email =
            document.getElementById("profileEmail");

        const displayName =
            document.getElementById("profileDisplayName");

        const userName =
            document.getElementById("userName");


        if (name) {
            name.value = perfil.nome || "Administrador";
        }


        if (email) {
            email.value =
                perfil.email || "admin@atlasgestao.com";
        }


        if (displayName) {
            displayName.textContent =
                perfil.nome || "Administrador";
        }


        if (userName) {
            userName.textContent =
                perfil.nome || "Administrador";
        }

    }


    carregarPerfil();


    if (profileForm) {

        profileForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const nome =
                document.getElementById("profileName").value.trim();

            const email =
                document.getElementById("profileEmail").value.trim();


            if (!nome || !email) {

                alert("Preencha nome e e-mail.");

                return;

            }


            const perfil = {

                nome: nome,

                email: email

            };


            localStorage.setItem(
                "atlasPerfil",
                JSON.stringify(perfil)
            );


            const displayName =
                document.getElementById("profileDisplayName");

            const userName =
                document.getElementById("userName");


            if (displayName) {
                displayName.textContent = nome;
            }


            if (userName) {
                userName.textContent = nome;
            }


            alert("Perfil atualizado com sucesso.");

        });

    }


    /* ==========================================
       TEMA
       ========================================== */

    const themeInputs =
        document.querySelectorAll(
            'input[name="theme"]'
        );


    const temaSalvo =
        localStorage.getItem("atlasTema");


    if (temaSalvo) {

        themeInputs.forEach(function (input) {

            input.checked =
                input.value === temaSalvo;

        });

    }


    themeInputs.forEach(function (input) {

        input.addEventListener("change", function () {

            if (!input.checked) {
                return;
            }


            const tema = input.value;


            localStorage.setItem(
                "atlasTema",
                tema
            );


            aplicarTema(tema);

        });

    });


    function aplicarTema(tema) {

        if (tema === "dark") {

            document.body.classList.add("dark-theme");

        } else {

            document.body.classList.remove("dark-theme");

        }

    }


    aplicarTema(
        temaSalvo || "light"
    );


    /* ==========================================
       PREFERÊNCIAS
       ========================================== */

    const notificationsToggle =
        document.getElementById(
            "notificationsToggle"
        );

    const stockToggle =
        document.getElementById(
            "stockToggle"
        );

    const qualityToggle =
        document.getElementById(
            "qualityToggle"
        );


    function carregarPreferencias() {

        const preferencias =
            JSON.parse(
                localStorage.getItem(
                    "atlasPreferencias"
                )
            );


        if (!preferencias) {
            return;
        }


        if (notificationsToggle) {

            notificationsToggle.checked =
                preferencias.notificacoes !== false;

        }


        if (stockToggle) {

            stockToggle.checked =
                preferencias.estoque !== false;

        }


        if (qualityToggle) {

            qualityToggle.checked =
                preferencias.qualidade !== false;

        }

    }


    carregarPreferencias();


    function salvarPreferencias() {

        const preferencias = {

            notificacoes:
                notificationsToggle
                    ? notificationsToggle.checked
                    : true,

            estoque:
                stockToggle
                    ? stockToggle.checked
                    : true,

            qualidade:
                qualityToggle
                    ? qualityToggle.checked
                    : true

        };


        localStorage.setItem(
            "atlasPreferencias",
            JSON.stringify(preferencias)
        );

    }


    [
        notificationsToggle,
        stockToggle,
        qualityToggle
    ].forEach(function (toggle) {

        if (toggle) {

            toggle.addEventListener(
                "change",
                salvarPreferencias
            );

        }

    });


    /* ==========================================
       LIMPAR DADOS
       ========================================== */

    const clearDataButton =
        document.getElementById(
            "clearDataButton"
        );


    if (clearDataButton) {

        clearDataButton.addEventListener(
            "click",
            function () {

                const confirmar = confirm(
                    "ATENÇÃO!\n\n" +
                    "Isso irá apagar os dados armazenados " +
                    "localmente pelo Atlas Gestão.\n\n" +
                    "Deseja continuar?"
                );


                if (!confirmar) {
                    return;
                }


                const confirmarNovamente = confirm(
                    "Tem certeza? Esta ação não poderá ser desfeita."
                );


                if (!confirmarNovamente) {
                    return;
                }


                localStorage.clear();


                alert(
                    "Dados locais removidos com sucesso."
                );


                window.location.href =
                    "index.html";

            }
        );

    }


    /* ==========================================
       LOGOUT
       ========================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                const confirmar = confirm(
                    "Deseja realmente sair do Atlas Gestão?"
                );


                if (!confirmar) {
                    return;
                }


                localStorage.removeItem(
                    "atlasUsuario"
                );


                window.location.href =
                    "index.html";

            }
        );

    }

});
