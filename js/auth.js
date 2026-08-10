/* =========================================================
   ATLAS GESTÃO
   SISTEMA DE AUTENTICAÇÃO
   js/auth.js

   Funcionalidades:
   - Cadastro automático do administrador
   - Login
   - Logout
   - Sessão
   - "Lembrar de mim"
   - Recuperação de senha demonstrativa
   - Proteção de páginas
   - Redirecionamento
   ========================================================= */


/* =========================================================
   1. CONFIGURAÇÕES
   ========================================================= */

const AUTH_CONFIG = {

    usersKey: "atlas_users",

    sessionKey: "atlas_session",

    rememberKey: "atlas_remember",

    themeKey: "atlas_theme",

    currentUserKey: "atlas_current_user",

    dashboardPage: "dashboard.html",

    loginPage: "index.html"

};


/* =========================================================
   2. USUÁRIO ADMINISTRADOR PADRÃO
   ========================================================= */

const DEFAULT_ADMIN = {

    id: "USR-001",

    name: "Administrador",

    email: "admin@atlasgestao.com",

    password: "123456",

    role: "Administrador",

    department: "Garantia da Qualidade",

    status: "Ativo",

    avatar: null,

    createdAt: new Date().toISOString()

};


/* =========================================================
   3. FUNÇÕES DE LOCALSTORAGE
   ========================================================= */


/**
 * Obtém usuários cadastrados.
 */
function getUsers() {

    try {

        const data =
            localStorage.getItem(
                AUTH_CONFIG.usersKey
            );

        if (!data) {
            return [];
        }

        const users = JSON.parse(data);

        return Array.isArray(users)
            ? users
            : [];

    } catch (error) {

        console.error(
            "Erro ao carregar usuários:",
            error
        );

        return [];
    }
}


/**
 * Salva usuários.
 */
function saveUsers(users) {

    try {

        localStorage.setItem(
            AUTH_CONFIG.usersKey,
            JSON.stringify(users)
        );

        return true;

    } catch (error) {

        console.error(
            "Erro ao salvar usuários:",
            error
        );

        return false;
    }
}


/* =========================================================
   4. INICIALIZAÇÃO DO USUÁRIO ADMINISTRADOR
   ========================================================= */

function initializeDefaultUser() {

    const users = getUsers();

    const adminExists =
        users.some(
            user =>
                user.email.toLowerCase() ===
                DEFAULT_ADMIN.email.toLowerCase()
        );

    if (!adminExists) {

        users.push(DEFAULT_ADMIN);

        saveUsers(users);

        console.log(
            "Usuário administrador criado."
        );
    }
}


/* =========================================================
   5. GERAÇÃO DE ID
   ========================================================= */

function generateUserId() {

    const users = getUsers();

    const number =
        String(users.length + 1)
            .padStart(3, "0");

    return `USR-${number}`;
}


/* =========================================================
   6. CRIAÇÃO DE USUÁRIO
   ========================================================= */

function createUser(userData) {

    const users = getUsers();

    if (
        !userData ||
        !userData.email ||
        !userData.password ||
        !userData.name
    ) {

        return {

            success: false,

            message:
                "Nome, e-mail e senha são obrigatórios."

        };
    }


    const email =
        userData.email
            .trim()
            .toLowerCase();


    const exists =
        users.some(
            user =>
                user.email.toLowerCase() ===
                email
        );


    if (exists) {

        return {

            success: false,

            message:
                "Já existe um usuário com este e-mail."

        };
    }


    const newUser = {

        id: generateUserId(),

        name: userData.name.trim(),

        email,

        password: userData.password,

        role:
            userData.role ||
            "Usuário",

        department:
            userData.department ||
            "Garantia da Qualidade",

        status:
            userData.status ||
            "Ativo",

        avatar:
            userData.avatar ||
            null,

        createdAt:
            new Date().toISOString()

    };


    users.push(newUser);

    const saved =
        saveUsers(users);


    if (!saved) {

        return {

            success: false,

            message:
                "Não foi possível salvar o usuário."

        };
    }


    return {

        success: true,

        user: sanitizeUser(newUser),

        message:
            "Usuário criado com sucesso."

    };
}


/* =========================================================
   7. LIMPEZA DOS DADOS DO USUÁRIO
   ========================================================= */

/**
 * Remove a senha antes de armazenar
 * o usuário na sessão.
 */
function sanitizeUser(user) {

    if (!user) {
        return null;
    }

    const safeUser = {
        ...user
    };

    delete safeUser.password;

    return safeUser;
}


/* =========================================================
   8. VALIDAR E-MAIL
   ========================================================= */

function isValidEmail(email) {

    const pattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return pattern.test(
        String(email).trim()
    );
}


/* =========================================================
   9. AUTENTICAR USUÁRIO
   ========================================================= */

function authenticateUser(email, password) {

    if (!email || !password) {

        return {

            success: false,

            message:
                "Informe e-mail e senha."

        };
    }


    const users = getUsers();


    const user =
        users.find(
            item =>
                item.email.toLowerCase() ===
                    email.trim().toLowerCase()
                &&
                item.password === password
        );


    if (!user) {

        return {

            success: false,

            message:
                "E-mail ou senha inválidos."

        };
    }


    if (
        user.status &&
        user.status.toLowerCase() !==
            "ativo"
    ) {

        return {

            success: false,

            message:
                "Este usuário está inativo."

        };
    }


    return {

        success: true,

        user: sanitizeUser(user),

        message:
            "Login realizado com sucesso."

    };
}


/* =========================================================
   10. CRIAR SESSÃO
   ========================================================= */

function createSession(user, remember = false) {

    if (!user) {
        return false;
    }


    const session = {

        authenticated: true,

        user,

        loginAt:
            new Date().toISOString(),

        remember

    };


    try {

        localStorage.setItem(
            AUTH_CONFIG.sessionKey,
            JSON.stringify(session)
        );

        localStorage.setItem(
            AUTH_CONFIG.currentUserKey,
            JSON.stringify(user)
        );


        if (remember) {

            localStorage.setItem(
                AUTH_CONFIG.rememberKey,
                "true"
            );

        } else {

            localStorage.removeItem(
                AUTH_CONFIG.rememberKey
            );
        }


        return true;

    } catch (error) {

        console.error(
            "Erro ao criar sessão:",
            error
        );

        return false;
    }
}


/* =========================================================
   11. OBTER SESSÃO
   ========================================================= */

function getSession() {

    try {

        const data =
            localStorage.getItem(
                AUTH_CONFIG.sessionKey
            );

        if (!data) {
            return null;
        }

        const session =
            JSON.parse(data);

        if (
            !session ||
            !session.authenticated
        ) {

            return null;
        }

        return session;

    } catch (error) {

        console.error(
            "Erro ao obter sessão:",
            error
        );

        return null;
    }
}


/* =========================================================
   12. USUÁRIO ATUAL
   ========================================================= */

function getCurrentUser() {

    const session =
        getSession();


    if (
        session &&
        session.user
    ) {

        return session.user;
    }


    try {

        const stored =
            localStorage.getItem(
                AUTH_CONFIG.currentUserKey
            );

        if (!stored) {
            return null;
        }

        return JSON.parse(stored);

    } catch (error) {

        return null;
    }
}


/* =========================================================
   13. VERIFICAR LOGIN
   ========================================================= */

function isAuthenticated() {

    const session =
        getSession();

    return Boolean(
        session &&
        session.authenticated &&
        session.user
    );
}


/* =========================================================
   14. LOGOUT
   ========================================================= */

function logout() {

    try {

        localStorage.removeItem(
            AUTH_CONFIG.sessionKey
        );

        localStorage.removeItem(
            AUTH_CONFIG.currentUserKey
        );

        /*
         * Mantemos a preferência de "lembrar"
         * apenas como informação visual.
         */

        window.location.href =
            AUTH_CONFIG.loginPage;

    } catch (error) {

        console.error(
            "Erro ao sair:",
            error
        );

        window.location.href =
            AUTH_CONFIG.loginPage;
    }
}


/* =========================================================
   15. PROTEGER PÁGINA
   ========================================================= */

function requireAuthentication() {

    if (!isAuthenticated()) {

        const currentPage =
            window.location.pathname
                .split("/")
                .pop();


        if (
            currentPage !==
                AUTH_CONFIG.loginPage
            &&
            currentPage !== ""
        ) {

            sessionStorage.setItem(
                "atlas_redirect_after_login",
                currentPage
            );
        }


        window.location.href =
            AUTH_CONFIG.loginPage;

        return false;
    }


    return true;
}


/* =========================================================
   16. REDIRECIONAR SE JÁ ESTIVER LOGADO
   ========================================================= */

function redirectIfAuthenticated() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();


    if (
        currentPage ===
            AUTH_CONFIG.loginPage
        ||
        currentPage === ""
    ) {

        if (isAuthenticated()) {

            window.location.href =
                AUTH_CONFIG.dashboardPage;
        }
    }
}


/* =========================================================
   17. REDIRECIONAMENTO APÓS LOGIN
   ========================================================= */

function redirectAfterLogin() {

    const redirectPage =
        sessionStorage.getItem(
            "atlas_redirect_after_login"
        );


    sessionStorage.removeItem(
        "atlas_redirect_after_login"
    );


    if (redirectPage) {

        window.location.href =
            redirectPage;

        return;
    }


    window.location.href =
        AUTH_CONFIG.dashboardPage;
}


/* =========================================================
   18. MENSAGENS DO FORMULÁRIO
   ========================================================= */

function showLoginError(message) {

    const errorBox =
        document.getElementById(
            "loginError"
        );

    const errorMessage =
        document.getElementById(
            "loginErrorMessage"
        );


    if (errorMessage) {

        errorMessage.textContent =
            message;
    }


    if (errorBox) {

        errorBox.classList.remove(
            "hidden"
        );
    }


    const successBox =
        document.getElementById(
            "loginSuccess"
        );


    if (successBox) {

        successBox.classList.add(
            "hidden"
        );
    }
}


function showLoginSuccess(message) {

    const successBox =
        document.getElementById(
            "loginSuccess"
        );

    const successMessage =
        document.getElementById(
            "loginSuccessMessage"
        );


    if (successMessage) {

        successMessage.textContent =
            message;
    }


    if (successBox) {

        successBox.classList.remove(
            "hidden"
        );
    }


    const errorBox =
        document.getElementById(
            "loginError"
        );


    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );
    }
}


function clearLoginMessages() {

    const errorBox =
        document.getElementById(
            "loginError"
        );

    const successBox =
        document.getElementById(
            "loginSuccess"
        );


    if (errorBox) {

        errorBox.classList.add(
            "hidden"
        );
    }


    if (successBox) {

        successBox.classList.add(
            "hidden"
        );
    }
}


/* =========================================================
   19. ERROS DOS CAMPOS
   ========================================================= */

function setFieldError(
    fieldId,
    errorId,
    hasError,
    message = ""
) {

    const field =
        document.getElementById(
            fieldId
        );

    const error =
        document.getElementById(
            errorId
        );


    if (field) {

        field.classList.toggle(
            "input-error",
            hasError
        );
    }


    if (error) {

        error.textContent =
            message;

        error.classList.toggle(
            "hidden",
            !hasError
        );
    }
}


/* =========================================================
   20. VALIDAR FORMULÁRIO
   ========================================================= */

function validateLoginForm() {

    const email =
        document.getElementById(
            "email"
        );

    const password =
        document.getElementById(
            "password"
        );


    if (!email || !password) {
        return false;
    }


    let valid = true;


    clearLoginMessages();


    /* E-mail */

    if (!email.value.trim()) {

        setFieldError(
            "email",
            "emailError",
            true,
            "Informe seu e-mail."
        );

        valid = false;

    } else if (
        !isValidEmail(
            email.value
        )
    ) {

        setFieldError(
            "email",
            "emailError",
            true,
            "Informe um e-mail válido."
        );

        valid = false;

    } else {

        setFieldError(
            "email",
            "emailError",
            false
        );
    }


    /* Senha */

    if (!password.value) {

        setFieldError(
            "password",
            "passwordError",
            true,
            "Informe sua senha."
        );

        valid = false;

    } else {

        setFieldError(
            "password",
            "passwordError",
            false
        );
    }


    return valid;
}


/* =========================================================
   21. ESTADO DO BOTÃO DE LOGIN
   ========================================================= */

function setLoginLoading(isLoading) {

    const button =
        document.getElementById(
            "loginButton"
        );

    const normalContent =
        document.getElementById(
            "loginButtonText"
        );

    const loadingContent =
        document.getElementById(
            "loginLoading"
        );


    if (button) {

        button.disabled =
            isLoading;
    }


    if (normalContent) {

        normalContent.classList.toggle(
            "hidden",
            isLoading
        );
    }


    if (loadingContent) {

        loadingContent.classList.toggle(
            "hidden",
            !isLoading
        );
    }
}


/* =========================================================
   22. MOSTRAR / ESCONDER SENHA
   ========================================================= */

function setupPasswordToggle() {

    const toggle =
        document.getElementById(
            "togglePassword"
        );

    const password =
        document.getElementById(
            "password"
        );

    const icon =
        document.getElementById(
            "passwordIcon"
        );


    if (
        !toggle ||
        !password ||
        !icon
    ) {

        return;
    }


    toggle.addEventListener(
        "click",
        function () {

            const isPassword =
                password.type ===
                "password";


            password.type =
                isPassword
                    ? "text"
                    : "password";


            if (isPassword) {

                icon.className =
                    "fa-regular fa-eye-slash";

                toggle.setAttribute(
                    "aria-label",
                    "Ocultar senha"
                );

                toggle.setAttribute(
                    "title",
                    "Ocultar senha"
                );

            } else {

                icon.className =
                    "fa-regular fa-eye";

                toggle.setAttribute(
                    "aria-label",
                    "Mostrar senha"
                );

                toggle.setAttribute(
                    "title",
                    "Mostrar senha"
                );
            }
        }
    );
}


/* =========================================================
   23. MODAL DE RECUPERAÇÃO
   ========================================================= */

function openRecoveryModal() {

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "hidden"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    const email =
        document.getElementById(
            "recoveryEmail"
        );


    if (email) {

        email.value = "";

        setTimeout(
            () => email.focus(),
            100
        );
    }


    const message =
        document.getElementById(
            "recoveryMessage"
        );


    if (message) {

        message.className =
            "form-alert hidden";

        message.textContent =
            "";
    }


    document.body.style.overflow =
        "hidden";
}


function closeRecoveryModal() {

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add(
        "hidden"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";
}


/* =========================================================
   24. RECUPERAÇÃO DE SENHA
   ========================================================= */

function processPasswordRecovery(email) {

    const message =
        document.getElementById(
            "recoveryMessage"
        );


    if (!email) {

        if (message) {

            message.className =
                "form-alert form-alert-error";

            message.innerHTML =
                `
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>
                    Informe seu e-mail.
                </span>
                `;
        }

        return false;
    }


    if (!isValidEmail(email)) {

        if (message) {

            message.className =
                "form-alert form-alert-error";

            message.innerHTML =
                `
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>
                    Informe um e-mail válido.
                </span>
                `;
        }

        return false;
    }


    const users =
        getUsers();


    const user =
        users.find(
            item =>
                item.email.toLowerCase() ===
                email.trim().toLowerCase()
        );


    /*
     * Não exibimos se o usuário existe ou não
     * em uma aplicação real.
     *
     * Para este protótipo, exibimos uma
     * mensagem demonstrativa.
     */

    if (message) {

        message.className =
            "form-alert form-alert-success";

        message.innerHTML =
            `
            <i class="fa-solid fa-circle-check"></i>
            <span>
                ${
                    user
                        ? "Solicitação registrada. Em uma versão de produção, as instruções seriam enviadas por e-mail."
                        : "Se o e-mail estiver cadastrado, você receberá as instruções para recuperação."
                }
            </span>
            `;
    }


    return true;
}


/* =========================================================
   25. FORMULÁRIO DE LOGIN
   ========================================================= */

function setupLoginForm() {

    const form =
        document.getElementById(
            "loginForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (
                !validateLoginForm()
            ) {

                return;
            }


            const email =
                document.getElementById(
                    "email"
                ).value;


            const password =
                document.getElementById(
                    "password"
                ).value;


            const remember =
                document.getElementById(
                    "rememberMe"
                )?.checked || false;


            setLoginLoading(true);


            /*
             * Pequeno atraso para tornar
             * a interação visual mais natural.
             */

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            const result =
                authenticateUser(
                    email,
                    password
                );


            if (!result.success) {

                setLoginLoading(false);

                showLoginError(
                    result.message
                );

                return;
            }


            const sessionCreated =
                createSession(
                    result.user,
                    remember
                );


            if (!sessionCreated) {

                setLoginLoading(false);

                showLoginError(
                    "Não foi possível iniciar sua sessão."
                );

                return;
            }


            showLoginSuccess(
                "Login realizado com sucesso. Redirecionando..."
            );


            /*
             * Pequeno atraso para o usuário
             * visualizar a mensagem.
             */

            setTimeout(
                function () {

                    redirectAfterLogin();

                },
                500
            );

        }
    );
}


/* =========================================================
   26. FORMULÁRIO DE RECUPERAÇÃO
   ========================================================= */

function setupRecoveryForm() {

    const form =
        document.getElementById(
            "forgotPasswordForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const input =
                document.getElementById(
                    "recoveryEmail"
                );


            if (!input) {
                return;
            }


            processPasswordRecovery(
                input.value
            );

        }
    );
}


/* =========================================================
   27. BOTÕES DO MODAL
   ========================================================= */

function setupRecoveryModal() {

    const openButton =
        document.getElementById(
            "forgotPasswordButton"
        );

    const closeButton =
        document.getElementById(
            "closeForgotPassword"
        );

    const cancelButton =
        document.getElementById(
            "cancelRecovery"
        );

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            openRecoveryModal
        );
    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeRecoveryModal
        );
    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeRecoveryModal
        );
    }


    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    modal
                ) {

                    closeRecoveryModal();
                }

            }
        );
    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                if (
                    modal &&
                    !modal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeRecoveryModal();
                }
            }
        }
    );
}


/* =========================================================
   28. LIMPAR ERRO AO DIGITAR
   ========================================================= */

function setupInputValidation() {

    const email =
        document.getElementById(
            "email"
        );

    const password =
        document.getElementById(
            "password"
        );


    if (email) {

        email.addEventListener(
            "input",
            function () {

                if (
                    email.value.trim()
                ) {

                    setFieldError(
                        "email",
                        "emailError",
                        false
                    );
                }

                clearLoginMessages();

            }
        );
    }


    if (password) {

        password.addEventListener(
            "input",
            function () {

                if (
                    password.value
                ) {

                    setFieldError(
                        "password",
                        "passwordError",
                        false
                    );
                }

                clearLoginMessages();

            }
        );
    }
}


/* =========================================================
   29. TEMA
   ========================================================= */

function getSavedTheme() {

    return localStorage.getItem(
        AUTH_CONFIG.themeKey
    );
}


function applySavedTheme() {

    const theme =
        getSavedTheme();


    if (
        theme ===
        "dark"
    ) {

        document.body.classList.add(
            "dark-theme"
        );

    } else {

        document.body.classList.remove(
            "dark-theme"
        );
    }
}


/* =========================================================
   30. EXPOR FUNÇÕES GLOBALMENTE
   ========================================================= */

window.AtlasAuth = {

    getUsers,

    saveUsers,

    createUser,

    authenticateUser,

    createSession,

    getSession,

    getCurrentUser,

    isAuthenticated,

    logout,

    requireAuthentication,

    redirectIfAuthenticated,

    redirectAfterLogin,

    initializeDefaultUser,

    sanitizeUser,

    isValidEmail

};


/* =========================================================
   31. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * Sempre garante que existe
         * um usuário administrador.
         */

        initializeDefaultUser();


        /*
         * Aplica tema salvo.
         */

        applySavedTheme();


        /*
         * Se estamos na tela de login
         * e já existe sessão, redirecionamos.
         */

        redirectIfAuthenticated();


        /*
         * Configura componentes do login.
         */

        setupLoginForm();

        setupPasswordToggle();

        setupRecoveryModal();

        setupRecoveryForm();

        setupInputValidation();

    }
);
