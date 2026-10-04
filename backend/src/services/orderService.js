const pool = require("../config/database");
const orderModel = require("../models/orderModel");

const createOrder = async (userId) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //1. Buscar os produtos do carrinho
    const items = await orderModel.getCartItems(userId, connection);

    if (items.length === 0) {
      throw new Error("O carrinho está vazio");
    }

    //2. Calcular o total usando os preços do banco
    const total = items.reduce((sum, item) => {
      return sum + Number(item.price) * item.quantity;
    }, 0);

    //3. Criar o pedido
    const orderId = await orderModel.createOrder(
      userId,
      total.toFixed(2),
      connection,
    );

    //4. Registrar os itens e atualizar o estoque
    for (const item of items) {
      const stockUpdated = await orderModel.updateProductStock(
        item.product_id,
        item.quantity,
        connection,
      );

      if (!stockUpdated) {
        throw new Error(`Estoque insuficiente para ${item.name}`);
      }

      await orderModel.createOrderItem(
        orderId,
        item.product_id,
        item.quantity,
        item.price,
        connection,
      );
    }

    //5. Limpar o carrinho
    await orderModel.clearCart(userId, connection);

    //6. Confirmar todas as operações
    await connection.commit();

    return {
      orderId,
      total: total.toFixed(2),
      items,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getOrdersByUserId = async (userId) => {
  const orders = await orderModel.getOrdersByUserId(userId);

  return orders;
};

const updateOrderStatus = async (orderId, status) => {
  const allowedStatuses = [
    "PENDING",
    "PAID",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Status de pedido inválido");
  }

  const updated = await orderModel.updateOrderStatus(orderId, status);

  if (!updated) {
    throw new Error("Pedido não encontrado");
  }

  return {
    orderId,
    status,
  };
};

const getAllOrders = async () => {
  const orders = await orderModel.getAllOrders();

  return orders;
};

const getOrderById = async (orderId, userId) => {
  const orders = await orderModel.getOrderById(orderId, userId);

  if (orders.length === 0) {
    throw new Error("Pedido não encontrado");
  }

  return orders;
};

const getOrderByIdAdmin = async (orderId) => {
  const orders = await orderModel.getOrderByIdAdmin(orderId);

  if (orders.length === 0) {
    throw new Error("pedido não encontrado");
  }

  return orders;
};

module.exports = {
  createOrder,
  getOrdersByUserId,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getOrderByIdAdmin,
};
