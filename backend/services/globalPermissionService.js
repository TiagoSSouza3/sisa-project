const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const globalPermissionsRef = db.collection(
  firebaseCollections.GLOBAL_PERMISSIONS
);

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
  const snapshot = await globalPermissionsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await globalPermissionsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await globalPermissionsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (where) => {
  const snapshot = await globalPermissionsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, where || {});

  await Promise.all(
    toDelete.map((item) => globalPermissionsRef.doc(item.id).delete())
  );
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
      "globalPermissionService.update requires an id or instance with id"
    );
  }

  await globalPermissionsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await globalPermissionsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.upsert = async (values, options = {}) => {
  const existingList = await exports.getAll(options);

  if (!existingList.length) {
    const created = await exports.create(values);
    return [created, true];
  }

  const current = existingList[0];
  await globalPermissionsRef
    .doc(current.id)
    .set({ ...current, ...values }, { merge: true });

  const snapshot = await globalPermissionsRef.doc(current.id).get();
  return [{ id: snapshot.id, ...snapshot.data() }, false];
};