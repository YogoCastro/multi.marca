const express = require("express");
const cors = require("cors");

const pool = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API Multicheiros funcionando!",
  });
});

app.get("/api/test/database", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS connected");

    res.json({
      messagem: "Conexão com o MySQL funcionando YC é o cara!",
      database: rows[0].connected === 1,
    });
  } catch (error) {
    console.error("Erro ao conectar ao MySQL:", error);

    res.status(500).json({
      message: "Erro ao conectar ao MySQL",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
