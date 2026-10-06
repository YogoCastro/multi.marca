const cartModel = require("../models/cartModel");

const addItem = async (userId, productId, quantity) => {
  const stock = await cartModel.getProductStock(productId);
  if (stock === null) {
    throw new Error("Produto não encontrado!");
  }

  const items = await cartModel.getCartByUserId(userId);

  const currentItem = items.find((item) => item.product_id === productId);

  const currentQuantity = currentItem ? Number(currentItem.quantity) : 0;

  const newQuantity = currentQuantity + quantity;

  if (newQuantity > stock) {
    throw new Error(
      `Quantidade solicitada ultrapassa o estoque disponivel. Estoque: ${stock}`,
    );
  }

  return cartModel.addItem(userId, productId, quantity);
};

const getCartByUserId = async (userId) => {
  const items = await cartModel.getCartByUserId(userId);

  const total = items.reduce((sum, item) => {
    return sum + Number(item.subtotal);
  }, 0);

  return {
    items,
    total: total.toFixed(2),
  };
};

const removeItem = async (userId, productId) => {
  return cartModel.removeItem(userId, productId);
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const stock = await cartModel.getProductStock(productId);

  if (stock === null) {
    throw new Error("Produto não encontrado!");
  }

  if (quantity > stock) {
    throw new Error(
      `Quantidade solicitada ultrapassa o estoque disponível. Estoque: ${stock}`,
    );
  }

  const items = await cartModel.getCartByUserId(userId);

  const currentItem = items.find((item) => item.product_id === productId);

  if (!currentItem) {
    throw new Error("Produto não encontrado no carrinho");
  }

  return cartModel.updateItemQuantity(userId, productId, quantity);
};

const clearCart = async (userId) => {
  return cartModel.clearCart(userId);
};

module.exports = {
  addItem,
  getCartByUserId,
  removeItem,
  updateItemQuantity,
  clearCart,
};
