/* ==========================================
   ATLAS GESTÃO
   CONTATO
   ========================================== */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("contactForm");
    const logoutButton = document.getElementById("logoutButton");
    const mobileMenu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");


    /* ==========================================
       MENU MOBILE
       ========================================== */

    if (mobileMenu && sidebar) {

        mobileMenu.addEventListener("click", function () {
            sidebar.classList.toggle("open");
        });

    }


    /* ==========================================
       ENVIO DO FORMULÁRIO
       ========================================== */

    if (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            const nome = document.getElementById("contactName").value.trim();
            const email = document.getElementById("contactEmail").value.trim();
            const assunto = document.getElementById("contactSubject").value;
            const mensagem = document.getElementById("contactMessage").value.trim();


            if (!nome || !email || !assunto || !mensagem) {

                alert("Preencha todos os campos.");
                return;

            }


            const mensagens =
                JSON.parse(localStorage.getItem("atlasMensagens")) || [];


            const novaMensagem = {

                id: Date.now(),

                nome: nome,

                email: email,

                assunto: assunto,

                mensagem: mensagem,

                data: new Date().toLocaleString("pt-BR"),

                status: "Recebida"

            };


            mensagens.push(novaMensagem);


            localStorage.setItem(
                "atlasMensagens",
                JSON.stringify(mensagens)
            );


            alert(
                "Mensagem enviada com sucesso!\n\n" +
                "Nossa equipe entrará em contato."
            );


            form.reset();

        });

    }


    /* ==========================================
       LOGOUT
       ========================================== */

    if (logoutButton) {

        logoutButton.addEventListener("click", function () {

            const confirmar = confirm(
                "Deseja realmente sair do Atlas Gestão?"
            );

            if (!confirmar) {
                return;
            }

            localStorage.removeItem("atlasUsuario");

            window.location.href = "index.html";

        });

    }

});
