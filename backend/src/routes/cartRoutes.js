//Importa o express
const express = require("express");

//Importa o Controller do carrinho
const cartController = require("../controllers/cartControllers");

//Importa o middleware de autenticação
const authMiddleware = require("../middlewares/authMiddleware");

//Cria o roteador
const router = express.Router();

//Adiciona um produto ao carrinho - exige login

router.post("/", authMiddleware, cartController.addItem);

router.get("/", authMiddleware, cartController.getCart);

// Remove produto do carrinho
router.delete("/:productId", authMiddleware, cartController.removeItem);

//Atualizar quantidade
router.put("/:productId", authMiddleware, cartController.updateItemQuantity);

//limpar carrinho inteiro
router.delete("/", authMiddleware, cartController.clearCart);

//Exporta as rotas
module.exports = router;
