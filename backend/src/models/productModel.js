const pool = require("../config/database");

const createProduct = async ({
  name,
  description,
  price,
  stock,
  image,
  images,
  sections,
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

  if (sections && sections.length > 0) {
    for (const sectionSlug of sections) {
      const [sectionRows] = await pool.query(
        `SELECT id
       FROM store_sections
       WHERE slug = ? AND active = TRUE`,
        [sectionSlug],
      );

      if (sectionRows.length > 0) {
        await pool.query(
          `INSERT INTO product_sections
          (product_id, section_id)
          VALUES (?, ?)`,
          [productId, sectionRows[0].id],
        );
      }
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

  const [sections] = await pool.query(
    `SELECT store_sections.slug
     FROM product_sections
     INNER JOIN store_sections
       ON product_sections.section_id = store_sections.id
     WHERE product_sections.product_id = ?`,
    [id],
  );

  products[0].sections = sections.map((section) => section.slug);

  return products[0];
};

const updateProduct = async (
  id,
  { name, description, price, stock, image, sections },
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

  await pool.query(
    `DELETE FROM product_sections
   WHERE product_id = ?`,
    [id],
  );

  if (sections && sections.length > 0) {
    for (const sectionSlug of sections) {
      const [sectionRows] = await pool.query(
        `SELECT id
       FROM store_sections
       WHERE slug = ? AND active = TRUE`,
        [sectionSlug],
      );

      if (sectionRows.length > 0) {
        await pool.query(
          `INSERT INTO product_sections
          (product_id, section_id)
          VALUES (?, ?)`,
          [id, sectionRows[0].id],
        );
      }
    }
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
