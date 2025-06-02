const express = require("express");
const router = express.Router();
const controller = require("../controllers/summaryDataController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAll);
router.put("/", authenticateToken, controller.updateSummaryData);
router.post("/", authenticateToken, controller.createSummaryData);

module.exports = router;
