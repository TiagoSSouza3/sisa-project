const express = require("express");
const router = express.Router();
const controller = require("../controllers/permissionController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAll);
router.post("/", authenticateToken, controller.setPermission);

module.exports = router;
