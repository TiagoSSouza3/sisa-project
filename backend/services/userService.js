const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const { applyWhere, applyAttributes } = require("./utilsService.js");
const usersRef = db.collection(firebaseCollections.USERS);


exports.getAll = async (options = {}) => {
  const snapshot = await usersRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  if (options.attributes) {
    data = applyAttributes(data, options.attributes);
  }

  if (options.limit && Number.isInteger(options.limit)) {
    data = data.slice(0, options.limit);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await usersRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (userToCreate) => {
  const docRef = await usersRef.add(userToCreate);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.findOneByEmail = async (email) => {
  const snapshot = await usersRef.where("email", "==", email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await usersRef.doc(idOrWhere).delete();
    return 1;
  }

  const snapshot = await usersRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(toDelete.map((item) => usersRef.doc(item.id).delete()));
  return toDelete.length;
};

exports.findOne = async (options = {}) => {
  const list = await exports.getAll(options);
  return list[0] || null;
};

exports.update = async (userOrId, update) => {
  const id = typeof userOrId === "string" ? userOrId : userOrId && userOrId.id;

  if (!id) {
    throw new Error("userService.update requires an id or user with id");
  }

  await usersRef.doc(id).set({ id, ...update }, { merge: true });
  const snapshot = await usersRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};
