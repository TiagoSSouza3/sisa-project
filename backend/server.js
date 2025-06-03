const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const studentsRoutes = require("./routes/studentsRoute");
const subjectRoutes = require("./routes/subjectRoutes");
const documentRoutes = require("./routes/documentRoutes");
const documentTemplateRoutes = require("./routes/documentTemplateRoutes");
const summaryDataRoutes = require("./routes/summaryDataRoutes");
const http = require('http');
const https = require('https');
const fs = require('fs');
const { Sequelize } = require("sequelize");
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
require("dotenv").config();

if (process.env.NODE_ENV === 'production') {
  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    console.error("As variáveis de ambiente do banco de dados não estão definidas corretamente");
    throw new Error("Falta configuração do banco de dados no arquivo .env");
  }

  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
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

  const connectWithRetry = async (retries = 5) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
      await this.sequelize.authenticate();
      console.log("Conexão com o banco de dados estabelecida com sucesso.");
      await this.sequelize.sync();
      return;
      } catch (error) {
        console.error(`Erro ao conectar ao banco de dados (tentativa${attempt}/${retries}):`, error.message);
        if (attempt === retries) {
        throw new Error("Falha ao conectar ao banco de dados após várias tentativas.");
        }
        await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
      }
    }
  }
} else {
  const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql"
  });
}


const app = express();

const PORT_HTTP = process.env.PORT || 5000;
const PORT_HTTPS = process.env.HTTPS_PORT || 5001;

const uploadsDir = path.join(__dirname, 'uploads');


if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT_HTTP, () => {
    console.log(`Server running in production at http://localhost:${PORT_HTTP}`);
  });
} else {
  // Em desenvolvimento, usamos HTTPS local com certificados autoassinados
  const key = fs.readFileSync('./cert/key.pem');
  const cert = fs.readFileSync('./cert/cert.pem');

  https.createServer({ key, cert }, app).listen(PORT_HTTPS, () => {
    console.log(`Dev server running at https://localhost:${PORT_HTTPS}`);
  });
}

const options = {
  key: fs.readFileSync('./cert/key.pem'),
  cert: fs.readFileSync('./cert/cert.pem')
};

// Configuração CORS mais detalhada
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: ['https://localhost:3000', 'https://127.0.0.1:3000',
      'https://amused-friendship-production.up.railway.app'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    }));
} else {	
  app.use(cors({
    origin: ['https://localhost:3000', 'https://127.0.0.1:3000'],
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
app.use("/api/documents", documentRoutes);
app.use("/api/templates", documentTemplateRoutes);
app.use("/api/summary_data", summaryDataRoutes);

app.get("/", (req, res) => {
  res.send("SISA API is running.");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API está funcionando!" });
});

const PORT = process.env.PORT || 5000;

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API URL: https://localhost:${port}/api`);
    console.log(`Test URL: https://localhost:${port}/api/test`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${port} em uso, tentando porta ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Erro ao iniciar o servidor:', err);
    }
  });
};

if (process.env.NODE_ENV == 'production') {
  this.connectWithRetry();

  module.exports = this.sequelize;
}

