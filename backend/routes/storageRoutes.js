const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storageController');
const authenticateToken = require('../middleware/authMiddleware');

router.get("/", authenticateToken, storageController.getStorage);
router.get("/:type/:id", authenticateToken, storageController.getStorageLogById);
router.get("/:type", authenticateToken, storageController.getStorageLog);
router.post("/", authenticateToken, storageController.createStorageItem);
router.put("/:id", authenticateToken, storageController.updateStorageItem);
router.delete("/:id", authenticateToken, storageController.deleteStorageItem);

module.exports = router; 