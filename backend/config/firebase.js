const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// REST evita gRPC; em dev no Windows costuma falhar com erros de certificado SSL.
if (process.env.NODE_ENV !== "production") {
  db.settings({ preferRest: true });
}

module.exports = db;