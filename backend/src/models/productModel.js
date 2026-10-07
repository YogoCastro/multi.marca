const pool = require("../config/database");

const createProduct = async ({
  name,
  description,
  price,
  stock,
  image,
  images,
}) => {
  const [result] = await pool.query(
    `INSERT INTO products
      (name, description, price, stock, image)
      VALUES (?, ?, ?, ?, ?)`,
    [name, description, price, stock, image],
  );

  const productId = result.insertId;

  if (images && images.length > 0) {
    for (const imagePath of images) {
      await pool.query(
        `INSERT INTO product_images
          (product_id, image)
          VALUES (?, ?)`,
        [productId, imagePath],
      );
    }
  }

  return {
    id: productId,
    name,
    description,
    price,
    stock,
    image,
    images,
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
        WHERE active = TRUE
        ORDER BY id DESC`,
  );

  for (const product of products) {
    const [images] = await pool.query(
      `SELECT
          id,
          image
        FROM product_images
        WHERE product_id = ?
        ORDER BY id ASC`,
      [product.id],
    );

    product.images = images;
  }

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
  let query;
  let values;

  if (image !== undefined) {
    query = `UPDATE products
        SET
            name = ?,
            description = ?,
            price = ?,
            stock = ?,
            image =?
        WHERE id = ?`;

    values = [name, description, price, stock, image, id];
  } else {
    query = `UPDATE products
        SET
            name = ?,
            description =?,
            price = ?,
            stock = ?
        WHERE id = ?`;
    values = [name, description, price, stock, id];
  }

  const [result] = await pool.query(query, values);

  if (result.affectedRows === 0) {
    return null;
  }

  return await getProductById(id);
};

const deleteProduct = async (id) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM products
       WHERE id = ?`,
      [id],
    );

    if (result.affectedRows > 0) {
      return true;
    }

    return null;
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      const [result] = await pool.query(
        `UPDATE products
         SET active = FALSE
         WHERE id = ?`,
        [id],
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return "inactive";
    }

    throw error;
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
