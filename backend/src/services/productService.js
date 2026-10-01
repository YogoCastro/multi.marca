const productModel = require("../models/productModel");

const createProduct = async (productData) => {
  return await productModel.createProduct(productData);
};

const getAllProducts = async () => {
  return await productModel.getAllProducts();
};

const getProductById = async (id) => {
  return await productModel.getProductById(id);
};

const updateProduct = async (id, productData) => {
  return await productModel.updateProduct(id, productData);
};

const deleteProduct = async (id) => {
  return await productModel.deleteProduct(id);
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
