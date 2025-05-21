const express = require("express");
const router = express.Router();
const controller = require("../controllers/participanteController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAllParticipants);
router.post("/", authenticateToken, controller.createParticipant);
router.put("/:id", authenticateToken, controller.updateParticipant);
router.delete("/:id", authenticateToken, controller.deleteParticipant);

module.exports = router;
