/* =========================================================
    AUTENTICAÇÃO - MULTICHEIROS
    ---------------------------------------------------------
    Nesta etapa a autenticação funciona apenas no frontend.

    O objetivo é testar:
    - Cadastro
    - Login
    - Validação
    - Mostrar/ocultar senha
    - Mensagens
    - Sessão temporária

    FUTURAMENTE:
    Esses dados serão substituídos pela API do backend.
========================================================= */

const USER_STORAGE_KEY = "multicheiros_user";
const SESSION_STORAGE_KEY = "multicheiros_session";

/* =========================================================
    ELEMENTOS
========================================================= */

const loginForm = document.getElementById("login-form");

const registerForm = document.getElementById("register-form");

/* =========================================================
    INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggles();

  setupLogin();

  setupRegister();
});

/* =========================================================
    LOGIN
========================================================= */

function setupLogin() {
  if (!loginForm) {
    return;
  }

  loginForm.addEventListener("submit", handleLogin);
}

/* =========================================================
    PROCESSAR LOGIN
========================================================= */

async function handleLogin(event) {
  event.preventDefault();

  clearFormErrors(loginForm);

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("remember");
  const formMessage = document.getElementById("form-message");

  if (!emailInput || !passwordInput) {
    return;
  }

  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  let valid = true;

  /* -----------------------------------------------------
        VALIDAR E-MAIL
  ----------------------------------------------------- */

  if (!email) {
    showFieldError("email-error", "Digite seu e-mail.");
    valid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("email-error", "Digite um e-mail válido.");
    valid = false;
  }

  /* -----------------------------------------------------
        VALIDAR SENHA
  ----------------------------------------------------- */

  if (!password) {
    showFieldError("password-error", "Digite sua senha.");
    valid = false;
  }

  if (!valid) {
    return;
  }

  /* -----------------------------------------------------
        LOGIN PELA API
  ----------------------------------------------------- */

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showFormMessage(
        formMessage,
        data.message || "E-mail ou senha incorretos.",
        "error",
      );

      return;
    }

    const user = data.user;
    const token = data.token;

    /* -----------------------------------------------------
          CRIAR SESSÃO
    ----------------------------------------------------- */

    const session = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token,
      loggedAt: new Date().toISOString(),
    };

    if (rememberInput && rememberInput.checked) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }

    /* -----------------------------------------------------
          SUCESSO
    ----------------------------------------------------- */

    showFormMessage(formMessage, "Login realizado com sucesso!", "success");

    const submitButton = loginForm.querySelector('button[type="submit"]');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Entrando...";
    }

    setTimeout(() => {
      window.location.href = "index.html";
    }, 700);
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);

    showFormMessage(
      formMessage,
      "Não foi possível conectar ao servidor.",
      "error",
    );
  }
}

/* =========================================================
    CADASTRO
========================================================= */

function setupRegister() {
  if (!registerForm) {
    return;
  }

  registerForm.addEventListener("submit", handleRegister);
}

/* =========================================================
    PROCESSAR CADASTRO
========================================================= */

async function handleRegister(event) {
  event.preventDefault();

  clearFormErrors(registerForm);

  const nameInput = document.getElementById("name");

  const emailInput = document.getElementById("email");

  const passwordInput = document.getElementById("password");

  const passwordConfirmInput = document.getElementById("password-confirm");

  const formMessage = document.getElementById("form-message");

  if (!nameInput || !emailInput || !passwordInput || !passwordConfirmInput) {
    return;
  }

  const name = nameInput.value.trim();

  const email = emailInput.value.trim().toLowerCase();

  const password = passwordInput.value;

  const passwordConfirm = passwordConfirmInput.value;

  let valid = true;

  /* -----------------------------------------------------
        VALIDAR NOME
    ----------------------------------------------------- */

  if (!name) {
    showFieldError("name-error", "Digite seu nome.");

    valid = false;
  } else if (name.length < 2) {
    showFieldError("name-error", "O nome precisa ter pelo menos 2 caracteres.");

    valid = false;
  }

  /* -----------------------------------------------------
        VALIDAR E-MAIL
    ----------------------------------------------------- */

  if (!email) {
    showFieldError("email-error", "Digite seu e-mail.");

    valid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("email-error", "Digite um e-mail válido.");

    valid = false;
  }

  /* -----------------------------------------------------
        VALIDAR SENHA
    ----------------------------------------------------- */

  if (!password) {
    showFieldError("password-error", "Digite uma senha.");

    valid = false;
  } else if (password.length < 6) {
    showFieldError(
      "password-error",
      "A senha precisa ter pelo menos 6 caracteres.",
    );

    valid = false;
  }

  /* -----------------------------------------------------
        CONFIRMAR SENHA
    ----------------------------------------------------- */

  if (!passwordConfirm) {
    showFieldError("password-confirm-error", "Confirme sua senha.");

    valid = false;
  } else if (password !== passwordConfirm) {
    showFieldError("password-confirm-error", "As senhas não coincidem.");

    valid = false;
  }

  if (!valid) {
    return;
  }

  /* -----------------------------------------------------
        VERIFICAR CONTA EXISTENTE
    ----------------------------------------------------- */

  /* -----------------------------------------------------
        CRIAR USUÁRIO TEMPORÁRIO
    ----------------------------------------------------- */

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        name,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      showFormMessage(
        formMessage,
        data.message || "Erro ao criar conta.",
        "error",
      );

      return;
    }

    showFormMessage(
      formMessage,
      "Conta criada com sucesso! Redirecionando para o login...",
      "success",
    );
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
    showFormMessage(
      formMessage,
      "Não foi possível conectar ao servidor.",
      "error",
    );
  }

  /* -----------------------------------------------------
    MENSAGEM DE SUCESSO
    ----------------------------------------------------- */

  showFormMessage(
    formMessage,
    "Conta criada com sucesso! Redirecionando para o login...",
    "success",
  );

  const submitButton = registerForm.querySelector('button[type="submit"]');

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.textContent = "Conta criada...";
  }

  /* -----------------------------------------------------
    REDIRECIONAR
    ----------------------------------------------------- */

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
}

/* =========================================================
    MOSTRAR / OCULTAR SENHA
========================================================= */

function setupPasswordToggles() {
  /*
        Login
    */

  setupPasswordToggle("password-toggle", "password");

  /*
        Cadastro - senha
    */

  setupPasswordToggle("password-toggle", "password");

  /*
        Cadastro - confirmação
    */

  setupPasswordToggle("password-confirm-toggle", "password-confirm");
}

/**
 * Configura um botão de mostrar/ocultar senha.
 */
function setupPasswordToggle(buttonId, inputId) {
  const button = document.getElementById(buttonId);

  const input = document.getElementById(inputId);

  if (!button || !input) {
    return;
  }

  /*
        Evita adicionar o mesmo evento duas vezes.
        Isso é útil porque login e cadastro
        possuem elementos com os mesmos IDs.
    */

  if (button.dataset.toggleInitialized === "true") {
    return;
  }

  button.dataset.toggleInitialized = "true";

  button.addEventListener("click", () => {
    const isPassword = input.type === "password";

    input.type = isPassword ? "text" : "password";

    button.textContent = isPassword ? "Ocultar" : "Mostrar";

    button.setAttribute(
      "aria-label",
      isPassword ? "Ocultar senha" : "Mostrar senha",
    );
  });
}

/* =========================================================
    VALIDAÇÃO DE E-MAIL
========================================================= */

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
    ERRO DE CAMPO
========================================================= */

function showFieldError(elementId, message) {
  const element = document.getElementById(elementId);

  if (!element) {
    return;
  }

  element.textContent = message;
}

/* =========================================================
    LIMPAR ERROS
========================================================= */

function clearFormErrors(form) {
  if (!form) {
    return;
  }

  const errors = form.querySelectorAll(".form-error, .field-error");

  errors.forEach((error) => {
    error.textContent = "";
  });

  const message = form.querySelector(".form-message");

  if (message) {
    message.textContent = "";

    message.className = "form-message";

    message.hidden = true;
  }
}

/* =========================================================
    MENSAGEM DO FORMULÁRIO
========================================================= */

function showFormMessage(element, message, type) {
  if (!element) {
    return;
  }

  element.textContent = message;

  element.className = `form-message ${type}`;

  element.hidden = false;
}

/* =========================================================
    USUÁRIO ARMAZENADO
========================================================= */

function getStoredUser() {
  try {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(storedUser);
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);

    return null;
  }
}

/* =========================================================
    SESSÃO ATUAL
========================================================= */

function getCurrentSession() {
  try {
    /*
            Primeiro verifica localStorage.
            Depois verifica sessionStorage.
        */

    const localSession = localStorage.getItem(SESSION_STORAGE_KEY);

    if (localSession) {
      return JSON.parse(localSession);
    }

    const temporarySession = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (temporarySession) {
      return JSON.parse(temporarySession);
    }

    return null;
  } catch (error) {
    console.error("Erro ao carregar sessão:", error);

    return null;
  }
}

/* =========================================================
    LOGOUT
========================================================= */

function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);

  sessionStorage.removeItem(SESSION_STORAGE_KEY);

  window.location.href = "index.html";
}

/* =========================================================
    VERIFICAR LOGIN
========================================================= */

function isLoggedIn() {
  return getCurrentSession() !== null;
}

/* =========================================================
    GERAR ID DO USUÁRIO
========================================================= */

function generateUserId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

/* =========================================================
    EXPORTAÇÕES GLOBAIS
========================================================= */

window.getStoredUser = getStoredUser;

window.getCurrentSession = getCurrentSession;

window.isLoggedIn = isLoggedIn;

window.logout = logout;

/* =========================================================
    DEBUG
========================================================= */

console.log("Auth Multicheiros carregado.");
