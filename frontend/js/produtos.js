const products = [];

/* =========================================================
    ELEMENTOS
========================================================= */

const productsContainer = document.getElementById("products-container");

const productSearch = document.getElementById("product-search");

const emptyProducts = document.getElementById("empty-products");

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar produtos:", data.message);

      return;
    }

    setProducts(data.products);
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

/* =========================================================
    ESTADO
========================================================= */

let displayedProducts = [...products];

/* =========================================================
    INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  setupProductSearch();
});

/* =========================================================
    RENDERIZAR PRODUTOS
========================================================= */

function renderProducts(productsToRender) {
  if (!productsContainer) {
    return;
  }

  productsContainer.innerHTML = "";

  if (!productsToRender || productsToRender.length === 0) {
    showEmptyProducts();

    return;
  }

  hideEmptyProducts();

  productsToRender.forEach((product) => {
    const card = createProductCard(product);

    productsContainer.appendChild(card);
  });

  displayedProducts = [...productsToRender];
}

/* =========================================================
    CRIAR CARD
========================================================= */

function createProductCard(product) {
  const article = document.createElement("article");

  article.className = "product-card";

  article.dataset.productId = product.id;

  const formattedPrice = formatCurrency(product.price);

  const hasStock = Number(product.stock) > 0;

  const imageHTML = product.image
    ? `
            <img
                src="${escapeHTML(product.image)}"
                alt="${escapeHTML(product.name)}"
            >
        `
    : `
            <div class="product-image-placeholder">
                <span>
                    Produto
                </span>
            </div>
        `;

  article.innerHTML = `

        <div class="product-image">

            ${imageHTML}

        </div>


        <div class="product-info">

            <h3 class="product-name">
                ${escapeHTML(product.name)}
            </h3>


            <p class="product-description">
                ${escapeHTML(product.description || "")}
            </p>


            <div class="product-footer">

                <strong class="product-price">
                    ${formattedPrice}
                </strong>


                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${escapeHTML(product.id)}"
                    ${!hasStock ? "disabled" : ""}
                >
                    ${hasStock ? "Adicionar ao carrinho" : "Sem estoque"}
                </button>

            </div>

        </div>

    `;

  setupAddToCartButton(article);

  return article;
}

/* =========================================================
    ADICIONAR AO CARRINHO
========================================================= */

function setupAddToCartButton(card) {
  const button = card.querySelector(".add-to-cart-button");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    const productId = button.dataset.productId;

    const product = products.find(
      (item) => String(item.id) === String(productId),
    );

    if (!product) {
      console.error("Produto não encontrado:", productId);

      return;
    }

    if (Number(product.stock) <= 0) {
      return;
    }

    /*
            A função addToCart vem do carrinho.js.
        */

    if (typeof window.addToCart !== "function") {
      console.error(
        "A função addToCart não está disponível. " +
          "Verifique se carrinho.js foi carregado.",
      );

      return;
    }

    window.addToCart(product);

    showAddedFeedback(button);
  });
}

/* =========================================================
    FEEDBACK DO BOTÃO
========================================================= */

function showAddedFeedback(button) {
  const originalText = button.textContent;

  button.textContent = "Adicionado ✓";

  button.disabled = true;

  setTimeout(() => {
    button.textContent = originalText;

    button.disabled = false;
  }, 1000);
}

/* =========================================================
    PESQUISA
========================================================= */

function setupProductSearch() {
  if (!productSearch) {
    return;
  }

  productSearch.addEventListener("input", handleProductSearch);
}

function handleProductSearch(event) {
  const searchTerm = event.target.value.trim().toLowerCase();

  if (!searchTerm) {
    renderProducts(products);

    return;
  }

  const filteredProducts = products.filter((product) => {
    const name = String(product.name || "").toLowerCase();

    const description = String(product.description || "").toLowerCase();

    return name.includes(searchTerm) || description.includes(searchTerm);
  });

  renderProducts(filteredProducts);
}

/* =========================================================
    PRODUTOS VAZIOS
========================================================= */

function showEmptyProducts() {
  if (!emptyProducts) {
    return;
  }

  emptyProducts.hidden = false;
}

function hideEmptyProducts() {
  if (!emptyProducts) {
    return;
  }

  emptyProducts.hidden = true;
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
    ESCAPAR HTML
========================================================= */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =========================================================
    FUNÇÕES PARA USO FUTURO
========================================================= */

/**
 * Retorna um produto pelo ID.
 */
function getProductById(productId) {
  return products.find((product) => String(product.id) === String(productId));
}

/**
 * Retorna todos os produtos.
 */
function getProducts() {
  return [...products];
}

/**
 * Atualiza a lista de produtos.
 *
 * Futuramente será útil quando os produtos
 * vierem da API.
 */
function setProducts(newProducts) {
  if (!Array.isArray(newProducts)) {
    console.error("A lista de produtos precisa ser um array.");

    return;
  }

  products.length = 0;

  products.push(...newProducts);

  renderProducts(products);
}

/* =========================================================
    EXPORTAÇÕES GLOBAIS
========================================================= */

window.getProductById = getProductById;

window.getProducts = getProducts;

window.setProducts = setProducts;

/* =========================================================
    DEBUG
========================================================= */

console.log("Produtos Multicheiros carregados:", products);
