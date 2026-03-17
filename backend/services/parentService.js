const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const parentsRef = db.collection(firebaseCollections.PARENTS);

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
        // suporte básico para like com %valor%
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
  const snapshot = await parentsRef.get();
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

  if (options.order && Array.isArray(options.order) && options.order.length) {
    const [field, direction] = options.order[0];
    data.sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      if (direction === "DESC") {
        return av < bv ? 1 : -1;
      }
      return av > bv ? 1 : -1;
    });
  }

  return data;
};

exports.findPk = async (id, _options = {}) => {
  const snapshot = await parentsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await parentsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.destroy = async (idOrWhere) => {
  if (typeof idOrWhere === "string") {
    await parentsRef.doc(idOrWhere).delete();
    return 1;
  }

  const snapshot = await parentsRef.get();
  if (snapshot.empty) return 0;

  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const toDelete = applyWhere(all, idOrWhere || {});

  await Promise.all(toDelete.map((item) => parentsRef.doc(item.id).delete()));
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
    throw new Error("parentService.update requires an id or instance with id");
  }

  await parentsRef.doc(id).set({ id, ...data }, { merge: true });
  const snapshot = await parentsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};