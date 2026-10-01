const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/database");

const registerUser = async ({ name, email, password }) => {
  // Verifica se o email já existe -> futuramente isso sai, YC
  const [existingUsers] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email],
  );

  if (existingUsers.length > 0) {
    throw new Error("O Email ja foi cadastrado anteriormente");
  }
  //Criptografa a senha \/
  const hashedPassword = await bcrypt.hash(password, 10);

  //Cria o usuário\/
  const [result] = await pool.query(
    `INSERT INTO users (name, email, password)
        VALUES (?, ?, ?)`,
    [name, email, hashedPassword],
  );

  return {
    id: result.insertId,
    name,
    email,
  };
};

const loginUser = async ({ email, password }) => {
  const [users] = await pool.query(
    "SELECT id, name, email, password, role FROM users WHERE email = ?",
    [email],
  );

  if (users.length === 0) {
    throw new Error("E-mail ou senha inválida");
  }

  const user = users[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Email ou senha inválidos");
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
