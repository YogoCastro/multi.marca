const session = getCurrentSession();

if (!session) {
  window.location.href = "../login.html";
}

if (session && session.role !== "ADMIN") {
  window.location.href = "../index.html";
}

// =====================================================
// LISTAR PRODUTOS NO PAINEL
// =====================================================

async function loadAdminProducts() {
  const productsTable = document.getElementById("products-table");

  if (!productsTable) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar produtos:", data.message);

      productsTable.innerHTML = `
                <tr class="admin-table-empty">
                    <td colspan="5">
                        Não foi possível carregar os produtos.
                    </td>
                </tr>
            `;

      return;
    }

    if (data.products.length === 0) {
      productsTable.innerHTML = `
                <tr class="admin-table-empty">
                    <td colspan="5">
                        Nenhum produto encontrado.
                    </td>
                </tr>
            `;

      return;
    }

    productsTable.innerHTML = "";

    data.products.forEach((product) => {
      const row = document.createElement("tr");

      row.innerHTML = `
                <td>${product.id}</td>

                <td>
                    <strong>
                        ${product.name}
                    </strong>
                </td>

                <td>
                    R$ ${Number(product.price).toFixed(2).replace(".", ",")}
                </td>

                <td>
                    ${product.stock}
                </td>

                <td>
                    <div class="admin-product-actions">

                        <a
                            href="produto-form.html?id=${product.id}"
                            class="admin-panel-link"
                        >
                            Editar
                        </a>

                        <button
                            type="button"
                            class="admin-delete-button"
                            data-product-id="${product.id}"
                        >
                            Excluir
                        </button>

                    </div>
                </td>
            `;

      productsTable.appendChild(row);

      const deleteButton = row.querySelector(".admin-delete-button");

      deleteButton.addEventListener("click", () => {
        deleteAdminProduct(product.id);
      });
    });
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

document.addEventListener("DOMContentLoaded", () => {
  loadAdminProducts();
});

// ========================================
// CADASTRO E EDIÇÃO DE PRODUTOS
// ========================================

async function setupProductForm() {
  const form = document.getElementById("product-form");

  // Esta função só funciona na página do formulário.
  if (!form) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const productId = params.get("id");

  const title = document.querySelector(".admin-header h1");
  const description = document.querySelector(".admin-header p");
  const submitButton = form.querySelector('button[type="submit"]');

  // Se existir ID na URL, carregar produto para edição.
  if (productId) {
    if (title) title.textContent = "Editar produto";

    if (description) {
      description.textContent = "Atualize as informações do produto.";
    }

    if (submitButton) {
      submitButton.textContent = "Salvar alterações";
    }

    try {
      const response = await fetch(`${API_URL}/products/${productId}`);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao buscar produto.");
      }

      const product = data.product || data;

      document.getElementById("product-name").value = product.name || "";

      document.getElementById("product-price").value = product.price ?? "";

      document.getElementById("product-stock").value = product.stock ?? "";

      document.getElementById("product-description").value =
        product.description || "";
    } catch (error) {
      console.error("Erro ao carregar produto:", error);
      alert(error.message);
    }
  }

  // Enviar cadastro ou atualização.
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentSession = getCurrentSession();

    if (!currentSession || !currentSession.token) {
      alert("Sua sessão expirou. Faça login novamente.");
      window.location.href = "../login.html";
      return;
    }

    const imageInput = document.getElementById("product-image");

    const formData = new FormData();

    formData.append(
      "name",
      document.getElementById("product-name").value.trim(),
    );

    formData.append("price", document.getElementById("product-price").value);

    formData.append("stock", document.getElementById("product-stock").value);

    formData.append(
      "description",
      document.getElementById("product-description").value.trim(),
    );

    for (const file of imageInput.files) {
      formData.append("image", file);
    }

    const isEditing = Boolean(productId);

    try {
      const response = await fetch(
        isEditing ? `${API_URL}/products/${productId}` : `${API_URL}/products`,
        {
          method: isEditing ? "PUT" : "POST",

          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },

          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível salvar o produto.");
      }

      alert(
        isEditing
          ? "Produto atualizado com sucesso!"
          : "Produto cadastrado com sucesso!",
      );

      window.location.href = "produtos.html";
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(error.message);
    }
  });
}

// Inicializar o formulário quando a página carregar.
document.addEventListener("DOMContentLoaded", setupProductForm);

// ========================================
// EXCLUIR PRODUTO
// ========================================

async function deleteAdminProduct(productId) {
  const currentSession = getCurrentSession();

  if (!currentSession || !currentSession.token) {
    alert("Sua sessão expirou. Faça login novamente.");
    window.location.href = "../login.html";
    return;
  }

  const confirmed = confirm("Tem certeza que deseja excluir este produto?");

  if (!confirmed) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products/${productId}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Não foi possível excluir o produto.");
    }

    alert("Produto excluído com sucesso!");

    loadAdminProducts();
  } catch (error) {
    console.error("Erro ao excluir produto:", error);

    alert(error.message);
  }
}

// ========================================
// LISTAR USUÁRIOS NO PAINEL
// ========================================

async function loadAdminUsers() {
  const usersTable = document.getElementById("users-table");

  if (!usersTable) {
    return;
  }

  const currentSession = getCurrentSession();

  if (!currentSession || !currentSession.token) {
    window.location.href = "../login.html";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar usuários:", data.message);

      usersTable.innerHTML = `
                <tr class="admin-table-empty">
                    <td colspan="5">
                        Não foi possível carregar os usuários.
                    </td>
                </tr>
            `;

      return;
    }

    if (data.users.length === 0) {
      usersTable.innerHTML = `
                <tr class="admin-table-empty">
                    <td colspan="5">
                        Nenhum usuário encontrado.
                    </td>
                </tr>
            `;

      return;
    }

    usersTable.innerHTML = "";

    data.users.forEach((user) => {
      const row = document.createElement("tr");

      const createdAt = new Date(user.created_at).toLocaleDateString("pt-BR");

      row.innerHTML = `
                <td>${user.id}</td>

                <td>
                    <strong>
                        ${user.name}
                    </strong>
                </td>

                <td>
                    ${user.email}
                </td>

                <td>
                    ${user.role}
                </td>

                <td>
                    ${createdAt}
                </td>
            `;

      usersTable.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadAdminUsers();
  loadAdminProductsCount();
  loadAdminUsersCount();
  loadAdminOrdersCount();
  loadAdminSalesTotal();
  loadRecentOrders();
  loadAdminStock();
});

// ========================================
// ATUALIZAR TOTAL DE PRODUTOS NO DASHBOARD
// ========================================

async function loadAdminProductsCount() {
  const productsCount = document.getElementById("admin-products-count");

  if (!productsCount) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar quantidade de produtos:", data.message);
      return;
    }

    productsCount.textContent = data.products.length;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// ========================================
// ATUALIZAR TOTAL DE USUÁRIOS NO DASHBOARD
// ========================================

async function loadAdminUsersCount() {
  const usersCount = document.getElementById("admin-users-count");

  if (!usersCount) {
    return;
  }

  try {
    const currentSession = getCurrentSession();

    if (!currentSession || !currentSession.token) {
      return;
    }

    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar quantidade de usuários:", data.message);
      return;
    }

    usersCount.textContent = data.users.length;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// ========================================
// ATUALIZAR TOTAL DE PEDIDOS NO DASHBOARD
// ========================================

async function loadAdminOrdersCount() {
  const ordersCount = document.getElementById("admin-orders-count");

  if (!ordersCount) {
    return;
  }

  try {
    const currentSession = getCurrentSession();

    if (!currentSession || !currentSession.token) {
      return;
    }

    const response = await fetch(`${API_URL}/orders/admin`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar quantidade de pedidos:", data.message);
      return;
    }

    const orders = data.orders || data;

    ordersCount.textContent = Array.isArray(orders) ? orders.length : 0;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// ========================================
// ATUALIZAR TOTAL DE VENDAS NO DASHBOARD
// ========================================

async function loadAdminSalesTotal() {
  const salesTotal = document.getElementById("admin-sales-total");

  if (!salesTotal) {
    return;
  }

  try {
    const currentSession = getCurrentSession();

    if (!currentSession || !currentSession.token) {
      return;
    }

    const response = await fetch(`${API_URL}/orders/admin`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar total de vendas:", data.message);
      return;
    }

    const orders = data.orders || data;

    const totalSales = orders.reduce((total, order) => {
      return total + Number(order.total);
    }, 0);

    salesTotal.textContent = `R$ ${totalSales.toFixed(2).replace(".", ",")}`;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// ========================================
// CARREGAR PEDIDOS RECENTES
// ========================================

async function loadRecentOrders() {
  const ordersTable = document.getElementById("recent-orders");

  if (!ordersTable) {
    return;
  }

  try {
    const currentSession = getCurrentSession();

    if (!currentSession || !currentSession.token) {
      return;
    }

    const response = await fetch(`${API_URL}/orders/admin`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar pedidos recentes:", data.message);
      return;
    }

    const orders = data.orders || data;

    if (!Array.isArray(orders) || orders.length === 0) {
      return;
    }

    ordersTable.innerHTML = "";

    orders.slice(0, 5).forEach((order) => {
      const row = document.createElement("tr");

      const date = new Date(order.created_at).toLocaleDateString("pt-BR");

      const total = Number(order.total).toFixed(2).replace(".", ",");

      row.innerHTML = `
                <td>
                    <strong>#${order.id}</strong>
                </td>

                <td>
                    ${order.customer_name}
                </td>

                <td>
                    ${date}
                </td>

                <td>
                    R$ ${total}
                </td>

                <td>
                    ${order.status}
                </td>
            `;

      ordersTable.appendChild(row);
    });
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

// ========================================
// PRODUTOS EM ESTOQUE
// ========================================

async function loadAdminStock() {
  const stockAvailable = document.getElementById("admin-stock-available");

  if (!stockAvailable) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/products`);

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar estoque:", data.message);
      return;
    }

    const products = data.products || data;

    const available = products.filter(
      (product) => Number(product.stock) > 0,
    ).length;

    stockAvailable.textContent = available;
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}
