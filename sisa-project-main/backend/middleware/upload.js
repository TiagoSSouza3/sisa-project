const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedName = sanitizeFileName(path.parse(file.originalname).name);
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${sanitizedName}-${uniqueSuffix}${extension}`);
    }
});

const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
];

const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas PDF e DOC/DOCX são aceitos.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Arquivo muito grande. O tamanho máximo permitido é 10MB.'
            });
        }
        return res.status(400).json({
            message: 'Erro no upload do arquivo.',
            error: error.message
        });
    }
    next(error);
};

module.exports = {
    upload,
    handleUploadError
}; 