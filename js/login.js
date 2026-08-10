```javascript
/* =========================================================
   ATLAS GESTÃO
   login.js
   Sistema de autenticação da página de login
   ========================================================= */


/* =========================================================
   CONFIGURAÇÕES
   ========================================================= */

const LOGIN_CONFIG = {

    dashboardUrl: "dashboard.html",

    sessionKey: "atlas_session",

    rememberKey: "atlas_remember_email",

    demoUser: {

        id: "demo-001",

        name: "Administrador",

        email: "admin@atlasgestao.com",

        password: "123456",

        role: "Administrador",

        status: "Ativo"

    }

};


/* =========================================================
   ELEMENTOS
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const rememberMe =
    document.getElementById("rememberMe");

const loginButton =
    document.getElementById("loginButton");

const loginButtonText =
    document.getElementById("loginButtonText");

const loginButtonIcon =
    document.getElementById("loginButtonIcon");

const loginAlert =
    document.getElementById("loginAlert");

const togglePassword =
    document.getElementById("togglePassword");

const passwordIcon =
    document.getElementById("passwordIcon");

const demoLogin =
    document.getElementById("demoLogin");

const forgotPassword =
    document.getElementById("forgotPassword");

const forgotPasswordModal =
    document.getElementById("forgotPasswordModal");

const closeForgotPassword =
    document.getElementById("closeForgotPassword");

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const recoveryEmail =
    document.getElementById("recoveryEmail");

const recoveryMessage =
    document.getElementById("recoveryMessage");


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeLogin
);


function initializeLogin() {

    loadRememberedEmail();

    checkExistingSession();

    setupEvents();

}


/* =========================================================
   EVENTOS
   ========================================================= */

function setupEvents() {


    /* LOGIN */

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            handleLogin
        );

    }


    /* MOSTRAR SENHA */

    if (togglePassword) {

        togglePassword.addEventListener(
            "click",
            togglePasswordVisibility
        );

    }


    /* LOGIN DEMONSTRAÇÃO */

    if (demoLogin) {

        demoLogin.addEventListener(
            "click",
            handleDemoLogin
        );

    }


    /* RECUPERAR SENHA */

    if (forgotPassword) {

        forgotPassword.addEventListener(
            "click",
            openRecoveryModal
        );

    }


    if (closeForgotPassword) {

        closeForgotPassword.addEventListener(
            "click",
            closeRecoveryModal
        );

    }


    if (forgotPasswordForm) {

        forgotPasswordForm.addEventListener(
            "submit",
            handlePasswordRecovery
        );

    }


    /* FECHAR MODAL CLICANDO FORA */

    if (forgotPasswordModal) {

        forgotPasswordModal.addEventListener(
            "click",
            function(event) {

                if (
                    event.target ===
                    forgotPasswordModal
                ) {

                    closeRecoveryModal();

                }

            }
        );

    }


    /* ESC */

    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape" &&
                forgotPasswordModal &&
                forgotPasswordModal.classList.contains("active")
            ) {

                closeRecoveryModal();

            }

        }
    );

}


/* =========================================================
   LOGIN
   ========================================================= */

function handleLogin(event) {

    event.preventDefault();


    const email =
        emailInput.value
            .trim()
            .toLowerCase();

    const password =
        passwordInput.value;


    clearLoginAlert();


    /* VALIDAÇÃO */

    if (!email) {

        showLoginAlert(
            "Digite seu e-mail.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (!isValidEmail(email)) {

        showLoginAlert(
            "Digite um e-mail válido.",
            "error"
        );

        emailInput.focus();

        return;

    }


    if (!password) {

        showLoginAlert(
            "Digite sua senha.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    if (password.length < 6) {

        showLoginAlert(
            "A senha deve possuir pelo menos 6 caracteres.",
            "error"
        );

        passwordInput.focus();

        return;

    }


    setLoginLoading(true);


    /*
     * Pequeno atraso para deixar a experiência
     * semelhante a uma autenticação real.
     */

    setTimeout(
        function() {

            const user =
                authenticateUser(
                    email,
                    password
                );


            if (!user) {

                setLoginLoading(false);

                showLoginAlert(
                    "E-mail ou senha incorretos.",
                    "error"
                );

                return;

            }


            createSession(user);


            if (rememberMe && rememberMe.checked) {

                localStorage.setItem(
                    LOGIN_CONFIG.rememberKey,
                    email
                );

            } else {

                localStorage.removeItem(
                    LOGIN_CONFIG.rememberKey
                );

            }


            showLoginAlert(
                "Login realizado com sucesso! Redirecionando...",
                "success"
            );


            setTimeout(
                function() {

                    window.location.href =
                        LOGIN_CONFIG.dashboardUrl;

                },
                700
            );

        },
        500
    );

}


/* =========================================================
   AUTENTICAÇÃO
   ========================================================= */

function authenticateUser(
    email,
    password
) {


    /*
     * Usuário administrador de demonstração.
     */

    if (
        email === LOGIN_CONFIG.demoUser.email &&
        password === LOGIN_CONFIG.demoUser.password
    ) {

        return {
            ...LOGIN_CONFIG.demoUser
        };

    }


    /*
     * Verifica usuários salvos no banco local.
     */

    const users =
        getUsersFromDatabase();


    const user =
        users.find(
            function(item) {

                return (
                    String(item.email)
                        .toLowerCase()
                        .trim() === email &&
                    String(item.password) === password &&
                    item.status !== "Inativo"
                );

            }
        );


    return user || null;

}


/* =========================================================
   BUSCAR USUÁRIOS
   ========================================================= */

function getUsersFromDatabase() {

    /*
     * Primeiro tenta utilizar funções existentes
     * no database.js.
     */

    try {

        if (
            typeof window.getUsers ===
            "function"
        ) {

            const users =
                window.getUsers();

            if (Array.isArray(users)) {

                return users;

            }

        }

    } catch (error) {

        console.warn(
            "Não foi possível utilizar getUsers().",
            error
        );

    }


    /*
     * Procura possíveis chaves do banco.
     */

    const possibleKeys = [

        "atlas_users",

        "atlas_usuarios",

        "users",

        "usuarios",

        "atlas_database"

    ];


    for (
        const key of possibleKeys
    ) {

        try {

            const data =
                localStorage.getItem(key);


            if (!data) {

                continue;

            }


            const parsed =
                JSON.parse(data);


            if (Array.isArray(parsed)) {

                return parsed;

            }


            if (
                parsed &&
                Array.isArray(parsed.users)
            ) {

                return parsed.users;

            }


            if (
                parsed &&
                Array.isArray(parsed.usuarios)
            ) {

                return parsed.usuarios;

            }

        } catch (error) {

            console.warn(
                `Erro ao ler ${key}`,
                error
            );

        }

    }


    return [];

}


/* =========================================================
   LOGIN DE DEMONSTRAÇÃO
   ========================================================= */

function handleDemoLogin() {

    clearLoginAlert();


    if (emailInput) {

        emailInput.value =
            LOGIN_CONFIG.demoUser.email;

    }


    if (passwordInput) {

        passwordInput.value =
            LOGIN_CONFIG.demoUser.password;

    }


    if (rememberMe) {

        rememberMe.checked =
            true;

    }


    showLoginAlert(
        "Usuário de demonstração carregado.",
        "success"
    );


    /*
     * Entra automaticamente após pequeno intervalo.
     */

    setTimeout(
        function() {

            if (loginForm) {

                loginForm.dispatchEvent(
                    new Event(
                        "submit",
                        {
                            bubbles: true,
                            cancelable: true
                        }
                    )
                );

            }

        },
        400
    );

}


/* =========================================================
   CRIAR SESSÃO
   ========================================================= */

function createSession(user) {

    const session = {

        authenticated: true,

        userId:
            user.id ||
            user.id_usuario ||
            `user-${Date.now()}`,

        name:
            user.name ||
            user.nome ||
            "Usuário",

        email:
            user.email ||
            "",

        role:
            user.role ||
            user.cargo ||
            "Usuário",

        loginAt:
            new Date().toISOString()

    };


    localStorage.setItem(

        LOGIN_CONFIG.sessionKey,

        JSON.stringify(session)

    );

}


/* =========================================================
   VERIFICAR SESSÃO EXISTENTE
   ========================================================= */

function checkExistingSession() {

    try {

        const session =
            localStorage.getItem(
                LOGIN_CONFIG.sessionKey
            );


        if (!session) {

            return;

        }


        const parsed =
            JSON.parse(session);


        if (
            parsed &&
            parsed.authenticated === true
        ) {

            /*
             * Usuário já está logado.
             */

            /*
             * Não redirecionamos imediatamente para
             * evitar problemas durante o desenvolvimento.
             *
             * Se desejar redirecionamento automático,
             * descomente:
             *
             * window.location.href =
             *     LOGIN_CONFIG.dashboardUrl;
             */

        }

    } catch (error) {

        console.warn(
            "Sessão inválida.",
            error
        );

        localStorage.removeItem(
            LOGIN_CONFIG.sessionKey
        );

    }

}


/* =========================================================
   MOSTRAR / OCULTAR SENHA
   ========================================================= */

function togglePasswordVisibility() {

    if (!passwordInput) {

        return;

    }


    const showingPassword =
        passwordInput.type === "text";


    passwordInput.type =
        showingPassword
            ? "password"
            : "text";


    if (passwordIcon) {

        passwordIcon.className =
            showingPassword
                ? "fa-regular fa-eye"
                : "fa-regular fa-eye-slash";

    }


    if (togglePassword) {

        togglePassword.setAttribute(
            "aria-label",
            showingPassword
                ? "Mostrar senha"
                : "Ocultar senha"
        );

    }

}


/* =========================================================
   CARREGAR E-MAIL LEMBRADO
   ========================================================= */

function loadRememberedEmail() {

    try {

        const savedEmail =
            localStorage.getItem(
                LOGIN_CONFIG.rememberKey
            );


        if (
            savedEmail &&
            emailInput
        ) {

            emailInput.value =
                savedEmail;


            if (rememberMe) {

                rememberMe.checked =
                    true;

            }

        }

    } catch (error) {

        console.warn(
            "Não foi possível carregar o e-mail salvo.",
            error
        );

    }

}


/* =========================================================
   RECUPERAÇÃO DE SENHA
   ========================================================= */

function openRecoveryModal(event) {

    if (event) {

        event.preventDefault();

    }


    if (!forgotPasswordModal) {

        return;

    }


    forgotPasswordModal.classList.add(
        "active"
    );


    if (recoveryEmail) {

        recoveryEmail.value =
            emailInput
                ? emailInput.value
                : "";

        setTimeout(
            function() {

                recoveryEmail.focus();

            },
            100
        );

    }

}


function closeRecoveryModal() {

    if (!forgotPasswordModal) {

        return;

    }


    forgotPasswordModal.classList.remove(
        "active"
    );


    clearRecoveryMessage();

}


/* =========================================================
   PROCESSAR RECUPERAÇÃO
   ========================================================= */

function handlePasswordRecovery(event) {

    event.preventDefault();


    const email =
        recoveryEmail.value
            .trim()
            .toLowerCase();


    clearRecoveryMessage();


    if (!email) {

        showRecoveryMessage(
            "Digite seu e-mail.",
            "error"
        );

        return;

    }


    if (!isValidEmail(email)) {

        showRecoveryMessage(
            "Digite um e-mail válido.",
            "error"
        );

        return;

    }


    /*
     * Verifica se o usuário existe.
     */

    const users =
        getUsersFromDatabase();


    const demoExists =
        email ===
        LOGIN_CONFIG.demoUser.email;


    const userExists =
        demoExists ||
        users.some(
            function(user) {

                return (
                    String(user.email)
                        .toLowerCase()
                        .trim() === email
                );

            }
        );


    if (userExists) {

        showRecoveryMessage(
            "E-mail localizado. Em uma versão conectada a um servidor, as instruções de recuperação seriam enviadas para este endereço.",
            "success"
        );

    } else {

        /*
         * Por segurança, não revelamos se um e-mail
         * realmente existe em uma implementação real.
         */

        showRecoveryMessage(
            "Se este e-mail estiver cadastrado, você receberá as instruções de recuperação.",
            "success"
        );

    }

}


/* =========================================================
   ALERTA DE LOGIN
   ========================================================= */

function showLoginAlert(
    message,
    type = "error"
) {

    if (!loginAlert) {

        return;

    }


    loginAlert.className =
        `login-alert show ${type}`;


    let icon =
        "fa-circle-exclamation";


    if (type === "success") {

        icon =
            "fa-circle-check";

    }


    if (type === "warning") {

        icon =
            "fa-triangle-exclamation";

    }


    loginAlert.innerHTML = `

        <i class="fa-solid ${icon}"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;

}


function clearLoginAlert() {

    if (!loginAlert) {

        return;

    }


    loginAlert.className =
        "login-alert";


    loginAlert.innerHTML =
        "";

}


/* =========================================================
   ALERTA DE RECUPERAÇÃO
   ========================================================= */

function showRecoveryMessage(
    message,
    type
) {

    if (!recoveryMessage) {

        return;

    }


    recoveryMessage.className =
        `recovery-message show ${type}`;


    recoveryMessage.textContent =
        message;

}


function clearRecoveryMessage() {

    if (!recoveryMessage) {

        return;

    }


    recoveryMessage.className =
        "recovery-message";


    recoveryMessage.textContent =
        "";

}


/* =========================================================
   ESTADO DO BOTÃO
   ========================================================= */

function setLoginLoading(
    loading
) {

    if (!loginButton) {

        return;

    }


    if (loading) {

        loginButton.classList.add(
            "loading"
        );


        loginButton.disabled =
            true;


        if (loginButtonText) {

            loginButtonText.textContent =
                "Entrando...";

        }


        if (loginButtonIcon) {

            loginButtonIcon.className =
                "fa-solid fa-spinner";

        }

    } else {

        loginButton.classList.remove(
            "loading"
        );


        loginButton.disabled =
            false;


        if (loginButtonText) {

            loginButtonText.textContent =
                "Entrar";

        }


        if (loginButtonIcon) {

            loginButtonIcon.className =
                "fa-solid fa-arrow-right";

        }

    }

}


/* =========================================================
   VALIDAÇÃO DE E-MAIL
   ========================================================= */

function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    return pattern.test(email);

}


/* =========================================================
   SEGURANÇA DE TEXTO
   ========================================================= */

function escapeHTML(value) {

    return String(value)

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
   EXPORTA FUNÇÕES PARA OUTROS ARQUIVOS
   ========================================================= */

window.AtlasAuth = {

    getSession: function() {

        try {

            const session =
                localStorage.getItem(
                    LOGIN_CONFIG.sessionKey
                );


            return session
                ? JSON.parse(session)
                : null;

        } catch {

            return null;

        }

    },


    isAuthenticated: function() {

        const session =
            this.getSession();


        return !!(
            session &&
            session.authenticated === true
        );

    },


    logout: function() {

        localStorage.removeItem(
            LOGIN_CONFIG.sessionKey
        );


        window.location.href =
            "index.html";

    }

};


/* =========================================================
   FIM DO LOGIN.JS
   ========================================================= */
```
