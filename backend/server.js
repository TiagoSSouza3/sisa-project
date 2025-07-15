const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const studentsRoutes = require("./routes/studentsRoute");
const subjectRoutes = require("./routes/subjectRoutes");
const summaryDataRoutes = require("./routes/summaryDataRoutes");
const documentRoutes = require("./routes/documentRoutes");
const documentTemplateRoutes = require("./routes/documentTemplateRoutes");
const documentLayoutRoutes = require("./routes/documentLayoutRoutes");
const templateRoutes = require("./routes/templateRoutes");
const allDocumentsRoutes = require("./routes/allDocumentsRoutes");

const fs = require('fs');
const { Sequelize } = require("sequelize");

// Agora as variáveis de ambiente estarão disponíveis
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

let sequelize;
let connectWithRetry;

// Configuração da conexão com o banco de dados
if (process.env.NODE_ENV === 'production') {
  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error("As variáveis de ambiente do banco de dados não estão definidas corretamente");
    throw new Error("Falta configuração do banco de dados no arquivo .env");
  }

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    } 
  });

  connectWithRetry = async (retries = 5) => {
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
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
      }
    }
  }
} else {
  // Configuração para desenvolvimento
  sequelize = new Sequelize(DB_NAME || 'sisa', DB_USER || 'root', DB_PASSWORD || '', {
    host: DB_HOST || 'localhost',
    port: DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log, // Habilita logs em desenvolvimento
    define: {
      timestamps: true
    }
  });

  // Função para conectar em desenvolvimento
  connectWithRetry = async (retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await sequelize.authenticate();
        console.log("✅ Conexão com o banco de dados estabelecida com sucesso.");
        await sequelize.sync({ alter: false }); // Não altera estrutura em dev
        return;
      } catch (error) {
        console.error(`❌ Erro ao conectar ao banco de dados (tentativa ${attempt}/${retries}):`, error.message);
        if (attempt === retries) {
          console.error("💥 Falha ao conectar ao banco de dados após várias tentativas.");
          console.error("🔧 Verifique se o MySQL está rodando e as credenciais do .env estão corretas");
          throw error;
        }
        await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds before retrying
      }
    }
  }
}


const app = express();

const uploadsDir = path.join(__dirname, 'uploads');


if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configurar options apenas se os certificados existirem
let options = {};
const keyPath = './cert/key.pem';
const certPath = './cert/cert.pem';

// Verificar se os certificados existem e são válidos
let useHTTPS = false;
try {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    options = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    useHTTPS = true;
    console.log('✅ Certificados SSL encontrados, HTTPS habilitado');
  } else {
    console.log('⚠️ Certificados SSL não encontrados, usando HTTP');
    useHTTPS = false;
  }
} catch (error) {
  console.log('⚠️ Erro ao carregar certificados SSL, usando HTTP:', error.message);
  useHTTPS = false;
}

// Configuração CORS mais detalhada
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: ['https://amused-friendship-production.up.railway.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
} else {	
  // Suporta tanto HTTP quanto HTTPS em desenvolvimento
  app.use(cors({
    origin: ['https://localhost:3000', 'https://127.0.0.1:3000', 
             'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
}

app.use(bodyParser.json({ limit: "10mb" }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/summary_data", summaryDataRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/document-templates", documentTemplateRoutes);
app.use("/api/document-layouts", documentLayoutRoutes);
app.use("/api/all-documents", allDocumentsRoutes);

app.get("/", (req, res) => {
  res.send("SISA API is running.");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API está funcionando!" });
});

const PORT = process.env.PORT || 5000;

const startServer = async (port) => {
  try {
    // Inicializar conexão com banco de dados
    await connectWithRetry();
    
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API URL: http://localhost:${port}/api`);
      console.log(`Test URL: http://localhost:${port}/api/test`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Porta ${port} em uso, tentando porta ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Erro ao iniciar o servidor:', err);
      }
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar o servidor:', error.message);
    process.exit(1);
  }
};

// Inicializar o servidor
startServer(PORT);

module.exports = sequelize;

