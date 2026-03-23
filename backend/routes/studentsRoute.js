const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentsController");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/", authenticateToken, controller.getAllStudents);
router.get("/:id", authenticateToken, controller.getStudentById);
router.get("/cpf/:cpf", authenticateToken, controller.verifyStudentByCPF);
router.post("/", authenticateToken, controller.createStudent);
router.put("/:id", authenticateToken, controller.updateStudent);
router.delete("/:id", authenticateToken, controller.deleteStudent);

module.exports = router;
