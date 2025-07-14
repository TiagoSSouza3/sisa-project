const multer = require('multer');
const storage = multer.memoryStorage();

module.exports = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos DOCX são permitidos'), false);
    }
  }
});