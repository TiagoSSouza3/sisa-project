import express from "express";
const router = express.Router();
import { getAllSubjects, createSubject, updateSubject, deleteSubject } from "../controllers/subjectController.js";
import authenticateToken from "../middleware/authMiddleware.js";

router.get("/", authenticateToken, getAllSubjects);
router.post("/", authenticateToken, createSubject);
router.put("/:id", authenticateToken, updateSubject);
router.delete("/:id", authenticateToken, deleteSubject);

export default router; 