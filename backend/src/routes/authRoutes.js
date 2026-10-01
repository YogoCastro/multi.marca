const express = require("express");

const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Rota protegida funcionando",
    user: req.user,
  });
});

router.get(
  "/admin-test",
  authMiddleware,
  roleMiddleware("ADMIN"),
  (req, res) => {
    res.json({
      message: "Acesso de administrador autorizado!",
      user: req.user,
    });
  },
);

module.exports = router;
