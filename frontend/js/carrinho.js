/* =========================================================
    CARRINHO - MULTICHEIROS
    ---------------------------------------------------------
    Neste momento o carrinho funciona apenas no frontend.

    Os produtos são armazenados no localStorage do navegador.
    Futuramente, essa lógica poderá ser adaptada para trabalhar
    com os produtos vindos da API.
========================================================= */

/* =========================================================
    CONFIGURAÇÃO
========================================================= */

const session = getCurrentSession();

if (!session) {
  window.location.href = "login.html";
}

const CART_STORAGE_KEY = "multicheiros_cart";

/* =========================================================
    ELEMENTOS DA PÁGINA
========================================================= */

const cartItemsContainer = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");

const cartCount = document.getElementById("cart-count");
const cartItemsCount = document.getElementById("cart-items-count");

const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");

const couponInput = document.getElementById("coupon");
const applyCouponButton = document.getElementById("apply-coupon");
const couponMessage = document.getElementById("coupon-message");

const checkoutButton = document.getElementById("checkout-button");

/* =========================================================
    ESTADO
========================================================= */

let cart = loadCart();

let appliedCoupon = null;

/* =========================================================
    INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadCartFromAPI();

  renderCart();

  setupCoupon();

  setupCheckout();
});

/* =========================================================
    LOCAL STORAGE
========================================================= */

/**
 * Carrega o carrinho salvo no navegador.
 */
function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart;
  } catch (error) {
    console.error("Erro ao carregar o carrinho:", error);

    return [];
  }
}

async function loadCartFromAPI() {
  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      console.log("Usuário não autenticado.");

      return;
    }

    const response = await fetch(`${API_URL}/cart`, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar carrinho:", data.message);

      return;
    }

    console.log("Carrinho recebido da API:", data);

    cart = data.items.map((item) => ({
      id: item.product_id,
      name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
    }));

    renderCart();
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

/**
 * Salva o carrinho no navegador.
 */
function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Erro ao salvar o carrinho:", error);
  }
}

/* =========================================================
    ADICIONAR PRODUTO
========================================================= */

/**
 * Adiciona um produto ao carrinho.
 *
 * Essa função ficará disponível globalmente para que
 * produtos.js possa chamá-la futuramente.
 *
 * Exemplo:
 *
 * addToCart({
 *     id: 1,
 *     name: "Produto",
 *     price: 49.90,
 *     image: "imagem.jpg",
 *     description: "Descrição"
 * });
 */
async function addToCart(product) {
  if (!product || product.id === undefined) {
    console.error("Produto inválido.", product);

    return;
  }

  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      alert("Faça login para adicionar produtos ao carrinho.");

      return;
    }

    const response = await fetch(`${API_URL}/cart`, {
      method: "POST",

      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        productId: product.id,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao adicionar produto:", data.message);

      alert(data.message || "Não foi possível adicionar o produto.");

      return;
    }

    console.log("Produto adicionado ao carrinho:", data);

    alert("Produto adicionado ao carrinho!");
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);

    alert("Não foi possível conectar ao servidor.");
  }
}

/* =========================================================
    REMOVER PRODUTO
========================================================= */

async function removeFromCart(productId) {
  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      alert("Faça login novamente.");
      return;
    }

    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao remover produto:", data.message);

      alert(data.message || "Não foi possível remover o produto.");

      return;
    }

    cart = cart.filter((item) => String(item.id) !== String(productId));

    saveCart();

    renderCart();

    console.log("Produto removido do carrinho:", data);
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);

    alert("Não foi possível conectar ao servidor.");
  }
}
/* =========================================================
    ALTERAR QUANTIDADE
========================================================= */

async function increaseQuantity(productId) {
  const product = cart.find((item) => String(item.id) === String(productId));

  if (!product) {
    return;
  }

  const newQuantity = product.quantity + 1;

  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      alert("Faça login novamente.");
      return;
    }

    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao aumentar quantidade:", data.message);

      alert(data.message || "Não foi possível aumentar a quantidade.");

      return;
    }

    product.quantity = newQuantity;

    saveCart();

    renderCart();
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);

    alert("Não foi possível conectar ao servidor.");
  }
}

async function decreaseQuantity(productId) {
  const product = cart.find((item) => String(item.id) === String(productId));

  if (!product) {
    return;
  }

  if (product.quantity <= 1) {
    removeFromCart(productId);
    return;
  }

  const newQuantity = product.quantity - 1;

  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      alert("Faça login novamente.");
      return;
    }

    const response = await fetch(`${API_URL}/cart/${productId}`, {
      method: "PUT",

      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        quantity: newQuantity,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao diminuir quantidade:", data.message);

      alert(data.message || "Não foi possível atualizar a quantidade.");

      return;
    }

    product.quantity = newQuantity;

    saveCart();

    renderCart();
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);

    alert("Não foi possível conectar ao servidor.");
  }
}

/* =========================================================
    RENDERIZAR CARRINHO
========================================================= */

function renderCart() {
  if (!cartItemsContainer) {
    return;
  }

  cartItemsContainer.innerHTML = "";

  const totalItems = getTotalItems();

  updateCartCount(totalItems);

  if (cartItemsCount) {
    cartItemsCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;
  }

  if (cart.length === 0) {
    showEmptyCart();

    updateSummary();

    return;
  }

  hideEmptyCart();

  cart.forEach((product) => {
    const itemElement = createCartItem(product);

    cartItemsContainer.appendChild(itemElement);
  });

  updateSummary();
}

/* =========================================================
    CRIAR ITEM DO CARRINHO
========================================================= */

function createCartItem(product) {
  const article = document.createElement("article");

  article.className = "cart-item";

  const subtotal = product.price * product.quantity;

  const imageHTML = product.image
    ? `
            <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
            >
        `
    : `
            <div
                class="cart-product-placeholder"
                aria-label="Imagem indisponível"
            >
                Sem imagem
            </div>
        `;

  article.innerHTML = `

        <div class="cart-item-image">

            ${imageHTML}

        </div>


        <div class="cart-item-info">

            <h3 class="cart-item-name">
                ${escapeHTML(product.name)}
            </h3>

            ${
              product.description
                ? `
                        <p class="cart-item-description">
                            ${escapeHTML(product.description)}
                        </p>
                    `
                : ""
            }

            <span class="cart-item-price">
                ${formatCurrency(product.price)}
                por unidade
            </span>

        </div>


        <div class="cart-item-actions">

            <div class="quantity-control">

                <button
                    type="button"
                    class="quantity-button"
                    data-action="decrease"
                    data-id="${escapeHTML(product.id)}"
                    aria-label="Diminuir quantidade"
                >
                    −
                </button>

                <span class="quantity-value">
                    ${product.quantity}
                </span>

                <button
                    type="button"
                    class="quantity-button"
                    data-action="increase"
                    data-id="${escapeHTML(product.id)}"
                    aria-label="Aumentar quantidade"
                >
                    +
                </button>

            </div>


            <strong class="cart-item-subtotal">
                ${formatCurrency(subtotal)}
            </strong>


            <button
                type="button"
                class="remove-item-button"
                data-action="remove"
                data-id="${escapeHTML(product.id)}"
            >
                Remover
            </button>

        </div>

    `;

  setupCartItemButtons(article);

  return article;
}

/* =========================================================
    BOTÕES DOS PRODUTOS
========================================================= */

function setupCartItemButtons(itemElement) {
  const buttons = itemElement.querySelectorAll("[data-action]");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      const productId = button.dataset.id;

      if (action === "increase") {
        increaseQuantity(productId);
      }

      if (action === "decrease") {
        decreaseQuantity(productId);
      }

      if (action === "remove") {
        removeFromCart(productId);
      }
    });
  });
}

/* =========================================================
    CONTADOR
========================================================= */

function getTotalItems() {
  return cart.reduce((total, product) => {
    return total + product.quantity;
  }, 0);
}

function updateCartCount(count) {
  if (!cartCount) {
    return;
  }

  cartCount.textContent = count;
}

/* =========================================================
    SUBTOTAL
========================================================= */

function getSubtotal() {
  return cart.reduce((total, product) => {
    return total + product.price * product.quantity;
  }, 0);
}

/* =========================================================
    FRETE
========================================================= */

function getShipping() {
  /*
        Por enquanto o frete é R$ 0,00.

        Futuramente podemos calcular isso através de:
        - CEP
        - endereço
        - peso
        - transportadora
        - API de frete
    */

  return 0;
}

/* =========================================================
    DESCONTO
========================================================= */

function getDiscount(subtotal) {
  if (!appliedCoupon) {
    return 0;
  }

  return subtotal * appliedCoupon.discount;
}

/* =========================================================
    TOTAL
========================================================= */

function getTotal() {
  const subtotal = getSubtotal();

  const shipping = getShipping();

  const discount = getDiscount(subtotal);

  return Math.max(0, subtotal + shipping - discount);
}

/* =========================================================
    ATUALIZAR RESUMO
========================================================= */

function updateSummary() {
  const subtotal = getSubtotal();

  const shipping = getShipping();

  const discount = getDiscount(subtotal);

  const total = getTotal();

  if (cartSubtotal) {
    cartSubtotal.textContent = formatCurrency(subtotal);
  }

  if (cartShipping) {
    cartShipping.textContent = formatCurrency(shipping);
  }

  if (cartTotal) {
    cartTotal.textContent = formatCurrency(total);
  }

  /*
        Caso futuramente adicionemos uma linha
        de desconto no HTML, ela poderá utilizar
        a variável "discount".
    */

  if (discount > 0) {
    console.log("Desconto aplicado:", formatCurrency(discount));
  }
}

/* =========================================================
    CARRINHO VAZIO
========================================================= */

function showEmptyCart() {
  if (cartEmpty) {
    cartEmpty.hidden = false;
  }

  if (cartItemsContainer) {
    cartItemsContainer.hidden = true;
  }
}

function hideEmptyCart() {
  if (cartEmpty) {
    cartEmpty.hidden = true;
  }

  if (cartItemsContainer) {
    cartItemsContainer.hidden = false;
  }
}

/* =========================================================
    CUPOM
========================================================= */

function setupCoupon() {
  if (!applyCouponButton) {
    return;
  }

  applyCouponButton.addEventListener("click", applyCoupon);

  if (couponInput) {
    couponInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();

        applyCoupon();
      }
    });
  }
}

function applyCoupon() {
  if (!couponInput || !couponMessage) {
    return;
  }

  const coupon = couponInput.value.trim().toUpperCase();

  if (!coupon) {
    showCouponMessage("Digite um cupom.", "error");

    return;
  }

  /*
        Cupom apenas para teste do frontend.

        Futuramente os cupons serão
        validados pelo backend.
    */

  if (coupon === "MULTI10") {
    appliedCoupon = {
      code: "MULTI10",
      discount: 0.1,
    };

    showCouponMessage("Cupom aplicado: 10% de desconto.", "success");

    updateSummary();

    return;
  }

  appliedCoupon = null;

  showCouponMessage("Cupom inválido.", "error");

  updateSummary();
}

function showCouponMessage(message, type) {
  if (!couponMessage) {
    return;
  }

  couponMessage.textContent = message;

  couponMessage.style.color = type === "success" ? "#166534" : "#dc2626";
}

/* =========================================================
    FINALIZAR COMPRA
========================================================= */

async function setupCheckout() {
  if (!checkoutButton) {
    return;
  }

  checkoutButton.addEventListener("click", async () => {
    if (cart.length === 0) {
      alert("Seu carrinho está vazio.");
      return;
    }

    try {
      const session =
        JSON.parse(localStorage.getItem("multicheiros_session")) ||
        JSON.parse(sessionStorage.getItem("multicheiros_session"));

      if (!session || !session.token) {
        alert("Faça login para finalizar a compra.");

        return;
      }

      checkoutButton.disabled = true;
      checkoutButton.textContent = "Processando...";

      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Erro ao criar pedido:", data.message);

        alert(data.message || "Não foi possível finalizar a compra.");

        checkoutButton.disabled = false;
        checkoutButton.textContent = "Finalizar compra";

        return;
      }

      console.log("Pedido criado:", data);

      alert(`Pedido #${data.order.orderId} criado com sucesso!`);

      cart = [];

      saveCart();

      renderCart();

      checkoutButton.disabled = false;
      checkoutButton.textContent = "Finalizar compra";
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);

      alert("Não foi possível conectar ao servidor.");

      checkoutButton.disabled = false;
      checkoutButton.textContent = "Finalizar compra";
    }
  });
}

/* =========================================================
    FORMATAÇÃO DE MOEDA
========================================================= */

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

/* =========================================================
    SEGURANÇA
========================================================= */

/**
 * Evita que dados de produtos inseridos no HTML
 * sejam interpretados como código HTML.
 */
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
    FUNÇÕES GLOBAIS
========================================================= */

/*
    Deixamos essas funções disponíveis globalmente
    para que produtos.js possa utilizá-las depois.
*/

window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;

/* =========================================================
    DEBUG
========================================================= */

console.log("Carrinho Multicheiros carregado.", cart);
