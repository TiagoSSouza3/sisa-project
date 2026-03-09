const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sisa',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
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
  }
);

const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida - config.js');
    await sequelize.sync({ alter: false });
    console.log('✅ Sincronização do banco de dados concluída');
  } catch (err) {
    console.error('❌ Erro ao conectar/sincronizar o banco de dados:', err);
    throw err;
  }
};

// Só executa se este arquivo for executado diretamente
if (require.main === module) {
  connectDatabase();
}

module.exports = sequelize;
