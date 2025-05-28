import express from "express";
const router = express.Router();
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from "../controllers/studentsController.js";
import authenticateToken from "../middleware/authMiddleware.js";

router.get("/", authenticateToken, getAllStudents);
router.get("/:id", authenticateToken, getStudentById);
router.post("/", authenticateToken, createStudent);
router.put("/:id", authenticateToken, updateStudent);
router.delete("/:id", authenticateToken, deleteStudent);

export default router;
