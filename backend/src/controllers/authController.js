const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !email || !password) {
      return res.status(400).json({
        message: "Nome, e-mail e senha são obrigatórios!",
      });
    }

    const user = await authService.registerUser({
      name,
      email,
      password,
    });

    res.status(201).json({
      message: "Usuário cadastro com sucesso!!",
      user,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "E-mail já foi cadastrado") {
      return res.status(409).json({
        messagem: error.message,
      });
    }

    res.status(500).json({
      message: "Erro ao cadastrar usuário",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "E-mail e senha são obrigatórios!",
      });
    }

    const result = await authService.loginUser({
      email,
      password,
    });

    res.json({
      message: "login realizafo com sucesso",
      ...result,
    });
  } catch (error) {
    console.error(error);

    if (error.message === "E-mail ou senha inválidos") {
      return res.status(401).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "erro ao realizar login",
    });
  }
};

module.exports = {
  register,
  login,
};
