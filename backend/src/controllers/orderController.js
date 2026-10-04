const orderService = require("../services/orderService");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const order = await orderService.createOrder(userId);

    return res.status(201).json({
      message: "Pedido criado com sucesso!",
      order,
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await orderService.getOrdersByUserId(userId);

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);

    return res.status(500).json({
      message: "Erro ao buscar pedidos",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = await orderService.updateOrderStatus(orderId, status);

    return res.status(200).json({
      message: "Status do pedido atualizado com sucesso",
      order,
    });
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();

    return res.status(200).json({
      orders,
    });
  } catch (error) {
    console.error("Erro ao buscar todos os pedidos:", error);

    return res.status(500).json({
      message: "Erro ao buscar todos os pedidos",
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    const order = await orderService.getOrderById(orderId, userId);

    return res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Erro ao buscar pedido:", error);

    return res.status(404).json({
      message: error.message,
    });
  }
};

const getOrderByIdAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await orderService.getOrderByIdAdmin(orderId);

    return res.status(200).json({
      order,
    });
  } catch (error) {
    console.error("Erro ao buscar pedido do administrador:", error);

    return res.status(404).json({
      message: error.message,
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getOrderByIdAdmin,
};
