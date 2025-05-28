import express from "express";
const router = express.Router();
import { getAll, setPermission } from "../controllers/permissionController.js";
import authenticateToken from "../middleware/authMiddleware.js";

router.get("/", authenticateToken, getAll);
router.post("/", authenticateToken, setPermission);

export default router;
