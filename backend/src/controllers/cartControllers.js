const cartService = require("../services/cartService");

const addItem = async (req, res) => {
  try {
    // Dados enviados pelo cliente
    const { productId, quantity } = req.body || {};

    // Valida os dados recebidos
    if (
      !Number.isInteger(Number(productId)) ||
      Number(productId) <= 0 ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        message: "Informe um produto e uma quantidade válidos",
      });
    }

    // Pega o ID do usuário autenticado pelo token
    const userId = req.user.id;

    //Chama o service para adicionar o produto
    await cartService.addItem(userId, Number(productId), Number(quantity));

    return res.status(200).json({
      message: "Produto adicionado ao carrinho com sucesso",
    });
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);

    if (error.message === "Produto não encontrado") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message.includes("Quantidade solicitada ultrapassa o estoque")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro ao adicionar produto ao carrinho",
    });
  }
};

const getCart = async (req, res) => {
  try {
    //ID do usuário vem do token JWT
    const userId = req.user.id;

    //Busca os itens do carrinho
    const cart = await cartService.getCartByUserId(userId);

    return res.status(200).json(cart);
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);

    return res.status(500).json({
      message: "Erro ao buscar carrinho",
    });
  }
};

const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      return res.status(400).json({
        message: "Produto inválido",
      });
    }

    const userId = req.user.id;

    const removed = await cartService.removeItem(userId, Number(productId));

    if (!removed) {
      return res.status(404).json({
        message: "Produto não encontrado no carrinho",
      });
    }

    return res.status(200).json({
      message: "Produto removido do carrinho com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover produto do carrinho", error);

    return res.status(500).json({
      message: "Erro ao remover produto do carrinho",
    });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body || {};

    if (!Number.isInteger(Number(productId)) || Number(productId) <= 0) {
      return res.status(400).json({
        message: "Produto inválido",
      });
    }

    if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
      return res.status(400).json({
        message: "Quantidade inválida",
      });
    }

    const userId = req.user.id;

    await cartService.updateItemQuantity(
      userId,
      Number(productId),
      Number(quantity),
    );

    return res.status(200).json({
      message: "Quantidade atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar quantidade:", error);

    if (error.message === "Produto não encontrado") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message === "Produto não encontrado no carrinho") {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (error.message.includes("Quantidade solicitada ultrapassa o estoque")) {
      return res.status(400).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Erro ao atualizar quantidade",
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cleared = await cartService.clearCart(userId);

    if (!cleared) {
      return res.status(404).json({
        message: "Carrinho já está vazio",
      });
    }

    return res.status(200).json({
      message: "Carrinho limpo com sucesso",
    });
  } catch (error) {
    console.error("Erro ao limpar carrinho:", error);

    return res.status(500).json({
      message: "Erro ao limpar carrinho",
    });
  }
};

//Exporta a função para as rotas
module.exports = {
  addItem,
  getCart,
  removeItem,
  updateItemQuantity,
  clearCart,
};
