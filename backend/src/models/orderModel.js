const pool = require("../config/database");

const createOrder = async (userId, total, connection) => {
  const [result] = await connection.query(
    `INSERT INTO orders
        (user_id, total)
        VALUES (?, ?)`,
    [userId, total],
  );

  return result.insertId;
};

const createOrderItem = async (
  orderId,
  productId,
  quantity,
  price,
  connection,
) => {
  await connection.query(
    `INSERT INTO order_items
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)`,
    [orderId, productId, quantity, price],
  );
};

const getCartItems = async (userId, connection) => {
  const [items] = await connection.query(
    `
        SELECT
            cart_items.product_id,
            cart_items.quantity,
            products.name,
            products.price,
            products.stock
        FROM cart_items
        INNER JOIN products
            ON cart_items.product_id = products.id
        WHERE cart_items.user_id = ?
        FOR UPDATE`,
    [userId],
  );

  return items;
};

const updateProductStock = async (productId, quantity, connection) => {
  const [result] = await connection.query(
    `UPDATE products
         SET stock = stock - ?
         WHERE id = ?
         AND stock >= ?`,
    [quantity, productId, quantity],
  );

  return result.affectedRows > 0;
};

const clearCart = async (userId, connection) => {
  await connection.query(
    `DELETE FROM cart_items
         WHERE user_id = ?`,
    [userId],
  );
};

const getOrdersByUserId = async (userId) => {
  const [orders] = await pool.query(
    `SELECT
            orders.id,
            orders.total,
            orders.status,
            orders.created_at,
            order_items.product_id,
            order_items.quantity,
            order_items.price,
            products.name
        FROM orders
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        WHERE orders.user_id = ?
        ORDER BY orders.created_at DESC`,
    [userId],
  );

  return orders;
};

const updateOrderStatus = async (orderId, status) => {
  const [result] = await pool.query(
    `UPDATE orders
         SET status = ?
         WHERE id = ?`,
    [status, orderId],
  );

  return result.affectedRows > 0;
};

const getAllOrders = async () => {
  const [orders] = await pool.query(
    `SELECT
            orders.id,
            orders.user_id,
            users.name AS customer_name,
            users.email AS customer_email,
            orders.total,
            orders.status,
            orders.created_at,
            order_items.product_id,
            order_items.quantity,
            order_items.price,
            products.name AS product_name
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        ORDER BY orders.created_at DESC`,
  );

  return orders;
};

const getOrderById = async (orderId, userId) => {
  const [orders] = await pool.query(
    `SELECT
            orders.id,
            orders.user_id,
            users.name AS customer_name,
            users.email AS customer_email,
            orders.total,
            orders.status,
            orders.created_at,
            order_items.product_id,
            order_items.quantity,
            order_items.price,
            products.name AS product_name
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        WHERE orders.id = ?
        AND orders.user_id = ?`,
    [orderId, userId],
  );

  return orders;
};

const getOrderByIdAdmin = async (orderId) => {
  const [orders] = await pool.query(
    `SELECT
            orders.id,
            orders.user_id,
            users.name AS customer_name,
            users.email AS customer_email,
            orders.total,
            orders.status,
            orders.created_at,
            order_items.product_id,
            order_items.quantity,
            order_items.price,
            products.name AS product_name
        FROM orders
        INNER JOIN users
            ON orders.user_id = users.id
        INNER JOIN order_items
            ON orders.id = order_items.order_id
        INNER JOIN products
            ON order_items.product_id = products.id
        WHERE orders.id = ?`,
    [orderId],
  );

  return orders;
};

module.exports = {
  createOrder,
  createOrderItem,
  getCartItems,
  updateProductStock,
  clearCart,
  getOrdersByUserId,
  updateOrderStatus,
  getAllOrders,
  getOrderById,
  getOrderByIdAdmin,
};
