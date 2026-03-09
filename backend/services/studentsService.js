const db = require("../config/firebase");
const { firebaseCollections } = require("../enums/firebaseCollections");

const Students = require("../models/Students"); //temp

const studentsRef = db.collection(firebaseCollections.STUDENTS);

exports.getAll = async (_options = {}) => {
  const snapshot = await studentsRef.get()

  if(snapshot.empty) return []

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
};

exports.create = async (data) => {
  const user = await studentsRef.add(data);
  return (await user.get()).data()
};

exports.findPk = async (id, options = {}) => {
  const item = await Students.findByPk(id, options);
  return item;
};

exports.destroy = async (idOrWhere) => {
  const where = typeof idOrWhere === "object" ? idOrWhere : { id: idOrWhere };
  const deleted = await Students.destroy({ where });
  return deleted;
};

exports.findOne = async (options) => {
  const item = await Students.findOne(options);
  return item;
};

exports.update = async (instance, data) => {
  await instance.update(data);
  return true;
};