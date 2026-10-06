const userService = require("../services/userService");

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.json({
      users,
    });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);

    res.status(500).json({
      message: "Erro ao buscar usuários",
    });
  }
};

module.exports = {
  getAllUsers,
};
