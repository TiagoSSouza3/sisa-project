const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const { applyWhere } = require("./utilsService.js");
const documentsRef = db.collection(firebaseCollections.DOCUMENTS);

exports.getAll = async (options = {}) => {
  const snapshot = await documentsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await documentsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await documentsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await documentsRef.doc(idOrWhere).delete();
    return 1;
  }

  const snapshot = await documentsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(toDelete.map((item) => documentsRef.doc(item.id).delete()));
  return toDelete.length;
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
      "DocumentService.update requires an id or instance with id"
    );
  }

  await documentsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await documentsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};