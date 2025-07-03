const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Sequelize } = require("sequelize");

// Carregar variáveis de ambiente ANTES de acessar process.env
dotenv.config();

const {
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
} = process.env;

let sequelize;
if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error("As variáveis de ambiente do banco de dados não estão definidas corretamente");
  throw new Error("Falta configuração do banco de dados no arquivo .env");
}
sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT || 3306,
  dialect: "mysql",
  logging: false,
  define: { timestamps: true },
  pool: { max: 5, min: 0, acquire: 30000, idle: 10000 }
});

// Função para conectar com retry
const connectWithRetry = async (retries = 5) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log("Conexão com o banco de dados estabelecida com sucesso.");
      await sequelize.sync();
      return;
    } catch (error) {
      console.error(`Erro ao conectar ao banco de dados (tentativa ${attempt}/${retries}):`, error.message);
      if (attempt === retries) {
        throw new Error("Falha ao conectar ao banco de dados após várias tentativas.");
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const app = express();

const PORT_HTTP = process.env.PORT || 5000;
const PORT_HTTPS = process.env.HTTPS_PORT || 5001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuração CORS para aceitar frontend local e produção
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
    'https://amused-friendship-production.up.railway.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/students", require("./routes/studentsRoute"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/summary_data", require("./routes/summaryDataRoutes"));
app.use("/api/documents", require("./routes/documentRoutes"));
app.use("/api/templates", require("./routes/documentTemplateRoutes"));

app.get("/", (req, res) => {
  res.send("SISA API is running.");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API está funcionando!" });
});

// Inicialização do servidor
const startServer = async () => {
  await connectWithRetry();

  // HTTPS em desenvolvimento se houver certificado, senão HTTP
  const certDir = path.join(__dirname, 'cert');
  const keyPath = path.join(certDir, 'key.pem');
  const certPath = path.join(certDir, 'cert.pem');
  let hasCert = fs.existsSync(keyPath) && fs.existsSync(certPath);

  if (process.env.NODE_ENV === 'production') {
    app.listen(PORT_HTTP, () => {
      console.log(`Server running in production at http://localhost:${PORT_HTTP}`);
    });
  } else {
    if (hasCert) {
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPath);
      https.createServer({ key, cert }, app).listen(PORT_HTTPS, () => {
        console.log(`Dev server running at https://localhost:${PORT_HTTPS}`);
      });
    } else {
      app.listen(PORT_HTTP, () => {
        console.log(`Dev server running at http://localhost:${PORT_HTTP}`);
      });
    }
  }
};

startServer();

module.exports = sequelize;

