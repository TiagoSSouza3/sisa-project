const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Função para sanitizar nome do arquivo
const sanitizeFileName = (fileName) => {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Substitui caracteres especiais por _
        .replace(/_{2,}/g, '_'); // Remove underscores múltiplos
};

// Configuração do armazenamento
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

// Lista de tipos MIME permitidos
const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Apenas PDF e DOCX são aceitos.'), false);
    }
};

// Configuração do Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1 // Apenas um arquivo por vez
    }
});

// Middleware de erro personalizado
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'Arquivo muito grande. O tamanho máximo permitido é 5MB.'
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
module.exports = upload; 