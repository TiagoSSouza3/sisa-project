const db = require("./firebase")

async function test() {
  await db.collection("test").add({
    message: "firebase funcionando",
    createdAt: new Date()
  })
}

test()