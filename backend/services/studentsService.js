const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const studentsRef = db.collection(firebaseCollections.STUDENTS);

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
  const snapshot = await studentsRef.get();
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

exports.create = async (data) => {
  const student = await studentsRef.add(data);
  const snapshot = await student.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await studentsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await studentsRef.doc(idOrWhere).delete();
    return true;
  }

  const snapshot = await studentsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(toDelete.map((item) => studentsRef.doc(item.id).delete()));
  return toDelete.length;
};

exports.update = async (id, data) => {
  if (!id) {
    throw new Error("studentsService.update requires an id");
  }

  await studentsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await studentsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};