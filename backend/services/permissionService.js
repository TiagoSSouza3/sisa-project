const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const permissionsRef = db.collection(firebaseCollections.PERMISSIONS);

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

      return item[key] === value;
    });
  });
};

exports.getAll = async (options = {}) => {
  const snapshot = await permissionsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await permissionsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await permissionsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await permissionsRef.doc(idOrWhere).delete();
    return true;
  }

  const snapshot = await permissionsRef.get();
  if (snapshot.empty) return false;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(
    toDelete.map((item) => permissionsRef.doc(item.id).delete())
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
      "permissionService.update requires an id or instance with id"
    );
  }

  await permissionsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await permissionsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.updateWhere = async (data, options = {}) => {
  const list = await exports.getAll(options);
  await Promise.all(
    list.map((item) =>
      permissionsRef.doc(item.id).set({ ...item, ...data }, { merge: true })
    )
  );
  return [list.length];
};