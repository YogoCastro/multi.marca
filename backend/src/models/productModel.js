const pool = require("../config/database");

const createProduct = async ({ name, description, price, stock, image }) => {
  const [result] = await pool.query(
    `INSERT INTO products
        (name, description, price, stock, image)
        VALUES (?, ?, ?, ?, ?)`,
    [name, description, price, stock, image],
  );

  return {
    id: result.insertId,
    name,
    description,
    price,
    stock,
    image,
  };
};

const getAllProducts = async () => {
  const [products] = await pool.query(
    `SELECT
            id,
            name,
            description,
            price,
            stock,
            image,
            created_at
        FROM products
        ORDER BY id DESC`,
  );

  return products;
};

const getProductById = async (id) => {
  const [products] = await pool.query(
    `SELECT
            id,
            name,
            description,
            price,
            stock,
            image,
            created_at
        FROM products
        WHERE id = ?`,
    [id],
  );

  if (products.length === 0) {
    return null;
  }

  return products[0];
};

const updateProduct = async (
  id,
  { name, description, price, stock, image },
) => {
  const [result] = await pool.query(
    `UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            stock = ?,
            image = ?
        WHERE id = ?`,
    [name, description, price, stock, image, id],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return await getProductById(id);
};

const deleteProduct = async (id) => {
  const [result] = await pool.query(
    `DELETE FROM products
        WHERE id = ?`,
    [id],
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return true;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
