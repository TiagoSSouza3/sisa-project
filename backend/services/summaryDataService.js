const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const summaryDataRef = db.collection(firebaseCollections.SUMMARY_DATA);

exports.getAll = async () => {
  const snapshot = await summaryDataRef.get();
  if (snapshot.empty) return [];

  const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return data;
};

exports.findPk = async (id) => {
  const snapshot = await summaryDataRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await summaryDataRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await summaryDataRef.doc(idOrWhere).delete();
    return true;
  }

  const snapshot = await summaryDataRef.get();
  if (snapshot.empty) return false;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const entries = Object.entries(idOrWhere || {});

  const toDelete = all.filter((item) =>
    entries.every(([key, value]) => item[key] === value)
  );

  await Promise.all(
    toDelete.map((item) => summaryDataRef.doc(item.id).delete())
  );
  return !!toDelete.length;
};

exports.findOne = async () => {
  const list = await exports.getAll();
  return list[0] || null;
};

exports.update = async (instanceOrId, data) => {
  const id =
    typeof instanceOrId === "string"
      ? instanceOrId
      : instanceOrId && instanceOrId.id;

  if (!id) {
    throw new Error(
      "summaryDataService.update requires an id or instance with id"
    );
  }

  await summaryDataRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await summaryDataRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};