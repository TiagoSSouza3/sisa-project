const express = require("express");
const router = express.Router();
const controller = require("../controllers/summaryDataController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAll);
router.post("/", authenticateToken, controller.createSummaryData);
router.put("/", authenticateToken, controller.updateSummaryData);

module.exports = router;
