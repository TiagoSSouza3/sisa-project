const express = require("express");
const router = express.Router();
const controller = require("../controllers/parentController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAllParents);
router.get("/search", authenticateToken, controller.searchParentsByName);
router.get("/:id", authenticateToken, controller.getParentById);
router.post("/", authenticateToken, controller.createParent);
router.put("/:id", authenticateToken, controller.updateParent);
router.delete("/:id", authenticateToken, controller.deleteParent);

module.exports = router;

