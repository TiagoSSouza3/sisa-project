const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const usersRef = db.collection(firebaseCollections.USERS);

const applyWhere = (items, where = {}) => {
  const entries = Object.entries(where);
  if (!entries.length) return items;

  return items.filter((item) => {
    return entries.every(([key, value]) => {
      if (value === null || value === undefined) {
        return item[key] == null;
      }

      if (Array.isArray(value)) {
        return value.includes(item[key]);
      }

      if (typeof value === "object" && value !== null) {
        if (typeof value.like === "string") {
          const search = value.like.replace(/%/g, "").toLowerCase();
          const current = (item[key] || "").toString().toLowerCase();
          return current.includes(search);
        }
      }

      return item[key] === value;
    });
  });
};

const applyAttributes = (items, attributes) => {
  if (!Array.isArray(attributes) || !attributes.length) return items;
  return items.map((item) => {
    const picked = {};
    attributes.forEach((attr) => {
      if (Object.prototype.hasOwnProperty.call(item, attr)) {
        picked[attr] = item[attr];
      }
    });
    return picked;
  });
};

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
