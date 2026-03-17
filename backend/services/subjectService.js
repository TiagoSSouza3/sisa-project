const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const subjectsRef = db.collection(firebaseCollections.SUBJECTS);

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

exports.getAll = async (options = {}) => {
  const snapshot = await subjectsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await subjectsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await subjectsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await subjectsRef.doc(idOrWhere).delete();
    return 1;
  }

  const snapshot = await subjectsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(toDelete.map((item) => subjectsRef.doc(item.id).delete()));
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
    throw new Error("subjectService.update requires an id or instance with id");
  }

  await subjectsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await subjectsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};