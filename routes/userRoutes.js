import express from "express";
const router = express.Router();
import { getAllUsers, createUser, deleteUser } from "../controllers/userController.js";
import authenticateToken from "../middleware/authMiddleware.js";

router.get("/", authenticateToken, getAllUsers);
router.post("/", authenticateToken, createUser);
router.delete("/:id", authenticateToken, deleteUser);

export default router;
