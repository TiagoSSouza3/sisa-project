import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentsRoutes from "./routes/studentsRoute.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import http from 'http';
import https from 'https';
import { readFileSync } from 'fs';

dotenv.config();
const app = express();

const PORT_HTTP = process.env.PORT || 5000;
const PORT_HTTPS = process.env.HTTPS_PORT || 5001;

if (process.env.NODE_ENV === 'production') {
  // Em produção, o HTTPS será gerenciado por um proxy reverso (como Nginx)
  app.listen(PORT_HTTP, () => {
    console.log(`Server running in production at http://localhost:${PORT_HTTP}`);
  });
} else {
  // Em desenvolvimento, usamos HTTPS local com certificados autoassinados
  const key = readFileSync('./cert/key.pem');
  const cert = readFileSync('./cert/cert.pem');

  https.createServer({ key, cert }, app).listen(PORT_HTTPS, () => {
    console.log(`Dev server running at https://localhost:${PORT_HTTPS}`);
  });
}

const options = {
  key: readFileSync('./cert/key.pem'),
  cert: readFileSync('./cert/cert.pem')
};

// Configuração CORS mais detalhada
app.use(cors({
  origin: ['https://localhost:3000', 'https://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/documents", documentRoutes);

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
