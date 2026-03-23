const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const { applyWhere } = require("./utilsService.js");
const occupationsRef = db.collection(firebaseCollections.OCCUPATIONS_ENUM);

exports.getAll = async (options = {}) => {
  const snapshot = await occupationsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await occupationsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await occupationsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await occupationsRef.doc(idOrWhere).delete();
    return true;
  }

  const snapshot = await occupationsRef.get();
  if (snapshot.empty) return false;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(
    toDelete.map((item) => occupationsRef.doc(item.id).delete())
  );
  return !!toDelete.length;
};

exports.findOne = async (options = {}) => {
  const list = await exports.getAll(options);
  return list[0] || null;
};

exports.update = async (instanceOrId, data) => {
  const id =
    typeof instanceOrId === "string"
      ? instanceOrId
      : instanceOrId && instanceOrId.id;

  if (!id) {
    throw new Error(
      "occupationsEnumService.update requires an id or instance with id"
    );
  }

  await occupationsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await occupationsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};