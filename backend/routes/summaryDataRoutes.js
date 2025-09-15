const express = require("express");
const router = express.Router();
const controller = require("../controllers/summaryDataController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAll);
router.post("/", authenticateToken, controller.createSummaryData);
router.put("/", authenticateToken, controller.updateSummaryData);

// Novos endpoints
router.get("/birthday-students/:month", authenticateToken, controller.getBirthdayStudents);
router.get("/students-by-subject", authenticateToken, controller.getStudentsBySubject);
router.get("/monthly-enrollments/:month/:year", authenticateToken, controller.getMonthlySubjectEnrollments);
router.get("/additional-stats", authenticateToken, controller.getAdditionalStats);

module.exports = router;
