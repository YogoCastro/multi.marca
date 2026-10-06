const session = getCurrentSession();

if (!session) {
  window.location.href = "login.html";
}

console.log("PEDIDOS.JS FOI CARREGADO");

console.log(
  "Sessão:",
  JSON.parse(localStorage.getItem("multicheiros_session")) ||
    JSON.parse(sessionStorage.getItem("multicheiros_session")),
);

document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
});

async function loadOrders() {
  const ordersContainer = document.getElementById("orders-container");

  try {
    const session =
      JSON.parse(localStorage.getItem("multicheiros_session")) ||
      JSON.parse(sessionStorage.getItem("multicheiros_session"));

    if (!session || !session.token) {
      ordersContainer.innerHTML = `
                <p>Faça login para visualizar seus pedidos.</p>
            `;
      return;
    }

    const response = await fetch(`${API_URL}/orders`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro ao buscar pedidos:", data.message);

      ordersContainer.innerHTML = `
                <p>Não foi possível carregar seus pedidos.</p>
            `;

      return;
    }

    console.log("Pedidos recebidos:", data);
    if (data.orders.length === 0) {
      ordersContainer.innerHTML = `
        <p>Você ainda não possui pedidos.</p>
    `;
      return;
    }

    ordersContainer.innerHTML = "";

    data.orders.forEach((order) => {
      const orderElement = document.createElement("div");

      orderElement.classList.add("order-card");

      orderElement.innerHTML = `
    <h2>Pedido #${order.id}</h2>

    <p>
        <strong>Produto:</strong>
        ${order.product_name}
    </p>

    <p>
        <strong>Quantidade:</strong>
        ${order.quantity}
    </p>

    <p>
        <strong>Preço:</strong>
        R$ ${Number(order.price).toFixed(2).replace(".", ",")}
    </p>

    <p>
        <strong>Total:</strong>
        R$ ${Number(order.total).toFixed(2).replace(".", ",")}
    </p>

    <p>
        <strong>Data:</strong>
        ${new Date(order.created_at).toLocaleDateString("pt-BR")}
    </p>

    <p class="order-status">
        <strong>Status:</strong>
        ${formatOrderStatus(order.status)}
    </p>
`;

      ordersContainer.appendChild(orderElement);
    });
  } catch (error) {
    console.error("Erro ao conectar com a API:", error);
  }
}

function formatOrderStatus(status) {
  const statuses = {
    PENDING: "Pendente",
    PAID: "Pago",
    SHIPPED: "Enviado",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };

  return statuses[status] || status;
}
