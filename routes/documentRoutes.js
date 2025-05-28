import express from "express";
const router = express.Router();
import { getDocuments, uploadDocument, deleteDocument } from "../controllers/documentController.js";
import authenticateToken from "../middleware/authMiddleware.js";

router.get("/", authenticateToken, getDocuments);
router.post("/", authenticateToken, uploadDocument);
router.delete("/:id", authenticateToken, deleteDocument);

export default router;
