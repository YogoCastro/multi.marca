const express = require("express");

const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

//Listar produtos YC
router.get("/", productController.getAllProducts);

//busca por id \/ YC
router.get("/:id", productController.getProductById);

// Atualizar produto — somente ADMIN
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.updateProduct,
);

// Excluir produto — somente ADMIN
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.deleteProduct,
);

//Criar produto - somente ADMIN YC
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  productController.createProduct,
);

module.exports = router;
