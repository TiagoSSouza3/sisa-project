const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");
const { applyWhere } = require("./utilsService.js");

const globalDocumentPermissionsRef = db.collection(
  firebaseCollections.GLOBAL_DOCUMENT_PERMISSIONS
);

const DEFAULT_PERMISSIONS = {
  can_view_documents: true,
  can_edit_documents: false,
  can_upload_documents: false,
  can_view_layouts: true,
  can_edit_layouts: false,
  can_upload_layouts: false,
  can_view_all_documents: true,
  can_edit_all_documents: false,
  can_upload_all_documents: false,
};

exports.DEFAULT_PERMISSIONS = DEFAULT_PERMISSIONS;

exports.getAll = async (options = {}) => {
  const snapshot = await globalDocumentPermissionsRef.get();
  if (snapshot.empty) return [];

  let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (options.where) {
    data = applyWhere(data, options.where);
  }

  if (options.order) {
    for (const [field, direction] of options.order) {
      data.sort((a, b) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return direction === "DESC" ? -cmp : cmp;
      });
    }
  }

  return data;
};

exports.findPk = async (id) => {
  const snapshot = await globalDocumentPermissionsRef.doc(id).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

exports.create = async (data) => {
  const docRef = await globalDocumentPermissionsRef.add(data);
  const snapshot = await docRef.get();
  return { id: snapshot.id, ...snapshot.data() };
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
      "globalDocumentPermissionService.update requires an id or instance with id"
    );
  }

  await globalDocumentPermissionsRef
    .doc(id)
    .set({ id, ...data, updated_at: new Date().toISOString() }, { merge: true });
  const snapshot = await globalDocumentPermissionsRef.doc(id).get();
  return { id: snapshot.id, ...snapshot.data() };
};

exports.upsertByRole = async (role, permissions) => {
  const now = new Date().toISOString();
  const existing = await exports.findOne({ where: { role } });

  if (existing) {
    return exports.update(existing, { ...permissions, role });
  }

  return exports.create({
    role,
    ...permissions,
    created_at: now,
    updated_at: now,
  });
};

exports.getByRoleOrDefault = async (role) => {
  const permission = await exports.findOne({ where: { role } });
  return permission || { role, ...DEFAULT_PERMISSIONS };
};

exports.ensureDefaults = async () => {
  for (const role of ["professor", "colaborador"]) {
    const existing = await exports.findOne({ where: { role } });
    if (!existing) {
      const now = new Date().toISOString();
      await exports.create({
        role,
        ...DEFAULT_PERMISSIONS,
        created_at: now,
        updated_at: now,
      });
    }
  }
};
