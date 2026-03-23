const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const { applyWhere } = require("./utilsService.js");
const granularPermissionsRef = db.collection(
  firebaseCollections.GRANULAR_PERMISSIONS
);

exports.getAll = async (options = {}) => {
  const snapshot = await granularPermissionsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await granularPermissionsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await granularPermissionsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (where) => {
  const snapshot = await granularPermissionsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, where || {});

  await Promise.all(
    toDelete.map((item) => granularPermissionsRef.doc(item.id).delete())
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
      "granularPermissionService.update requires an id or instance with id"
    );
  }

  await granularPermissionsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await granularPermissionsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.updateWhere = async (data, options = {}) => {
  const list = await exports.getAll(options);
  await Promise.all(
    list.map((item) =>
      granularPermissionsRef.doc(item.id).set({ ...item, ...data }, { merge: true })
    )
  );
  return [list.length];
};