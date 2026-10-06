const pool = require("../config/database");

const addItem = async (userId, productId, quantity) => {
  const [result] = await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE
         quantity = quantity + VALUES(quantity)`,
    [userId, productId, quantity],
  );
  return result;
};

const getProductStock = async (productId) => {
  const [products] = await pool.query(
    `SELECT stock
        FROM products
        WHERE id = ?`,
    [productId],
  );

  if (products.length === 0) {
    return null;
  }

  return products[0].stock;
};

const getCartByUserId = async (userId) => {
  const [items] = await pool.query(
    `SELECT
            cart_items.id,
            cart_items.product_id,
            products.name,
            products.price,
            cart_items.quantity,
            (products.price * cart_items.quantity) AS subtotal
        FROM cart_items
        INNER JOIN products
            ON cart_items.product_id = products.id
        WHERE cart_items.user_id = ?`,
    [userId],
  );

  return items;
};

const removeItem = async (userId, productId) => {
  const [result] = await pool.query(
    `DELETE FROM cart_items
        WHERE user_id = ?
        AND product_id = ?`,
    [userId, productId],
  );

  if (result.affectedRows === 0) {
    return false;
  }

  return true;
};

const updateItemQuantity = async (userId, productId, quantity) => {
  const [result] = await pool.query(
    `UPDATE cart_items
        SET quantity = ?
        WHERE user_id = ?
        AND product_id = ?`,
    [quantity, userId, productId],
  );

  if (result.affectedRows === 0) {
    return false;
  }

  return true;
};

const clearCart = async (userId) => {
  const [result] = await pool.query(
    `DELETE FROM cart_items
         WHERE user_id = ?`,
    [userId],
  );

  return result.affectedRows > 0;
};

module.exports = {
  addItem,
  getCartByUserId,
  getProductStock,
  removeItem,
  updateItemQuantity,
  clearCart,
};
