const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, userController.getAllUsers);
router.get("/:id", authenticateToken, userController.getUserById);
router.put("/:id", authenticateToken, userController.editUser);
router.post("/", authenticateToken, userController.createUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

// Rotas para redefinição de senha (sem autenticação)
router.post("/request-password-reset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);
router.get("/check-token/:token", userController.checkFirstLogin);
router.get("/check-first-access/:id", authenticateToken, userController.checkUserFirstAccess);
router.post("/test-email", userController.testEmail);

module.exports = router;
