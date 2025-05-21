const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const participanteRoutes = require("./routes/participanteRoute");
const activityRoutes = require("./routes/activityRoutes");
const documentRoutes = require("./routes/documentRoutes");

dotenv.config();
const app = express();

// Configuração CORS mais detalhada
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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
app.use("/api/participants", participanteRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.send("SISA API is running.");
});

// Rota de teste
app.get("/api/test", (req, res) => {
  res.json({ message: "API está funcionando!" });
});

const PORT = process.env.PORT || 5000;

// Função para tentar iniciar o servidor em diferentes portas
const startServer = (port) => {
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
};

startServer(PORT);
