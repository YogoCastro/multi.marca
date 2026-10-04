const express = require("express");

const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.post("/", authMiddleware, orderController.createOrder);

router.get(
  "/admin/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  orderController.getOrderByIdAdmin,
);

router.get(
  "/admin",
  authMiddleware,
  roleMiddleware("ADMIN"),
  orderController.getAllOrders,
);

router.get("/:id", authMiddleware, orderController.getOrderById);

router.get("/", authMiddleware, orderController.getOrders);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("ADMIN"),
  orderController.updateOrderStatus,
);

module.exports = router;
