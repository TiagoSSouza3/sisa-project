const express = require("express");
const router = express.Router();
const activityController = require("../controllers/activityController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, activityController.getAllActivities);
router.post("/", authenticateToken, activityController.createActivity);
router.delete("/:id", authenticateToken, activityController.deleteActivity);

module.exports = router;
