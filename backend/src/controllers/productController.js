const productService = require("../services/productService");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;

    console.log("ARQUIVOS RECEBIDOS:", req.files);

    const image = req.files?.length
      ? `/uploads/products/${req.files[0].filename}`
      : null;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Nome, preço e estoque são obrigatórios",
      });
    }

    const images = req.files
      ? req.files.map((file) => `/uploads/products/${file.filename}`)
      : [];

    const product = await productService.createProduct({
      name,
      description,
      price,
      stock,
      image,
      images,
    });

    res.status(201).json({
      message: "Produto criado com sucesso",
      product,
    });
  } catch (error) {
    console.error("Erro ao criar produto:", error);

    res.status(500).json({
      message: "Erro ao criar produto",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.json({
      products,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);

    res.status(500).json({
      message: "Erro ao buscar produtos",
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    res.json({
      product,
    });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);

    res.status(500).json({
      message: "Erro ao buscar produto",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, price, stock } = req.body;

    const image = req.file.length
      ? `/uploads/products/${req.file.filename}`
      : undefined;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        message: "Nome, preço e estoque são obrigatórios",
      });
    }

    const product = await productService.updateProduct(id, {
      name,
      description,
      price,
      stock,
      image,
    });

    if (!product) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    res.json({
      message: "Produto atualizado com sucesso",
      product,
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);

    res.status(500).json({
      message: "Erro ao atualizar produto",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await productService.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Produto não encontrado",
      });
    }

    res.json({
      message: "Produto excluído com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir produto:", error);

    res.status(500).json({
      message: "Erro ao excluir produto",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
