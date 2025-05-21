const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, userController.getAllUsers);
router.post("/", authenticateToken, userController.createUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

module.exports = router;
