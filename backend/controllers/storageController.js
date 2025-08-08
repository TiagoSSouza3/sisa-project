const Storage = require('../models/Storage');
const StorageLog = require('../models/StorageLog');

exports.getStorage = async (req, res) => {
    const storage = await Storage.findAll();
    res.json(storage);
};

exports.getStorageLog = async (req, res) => {
    if(req.params.type != "log") return
    const storage_log = await StorageLog.findAll();
    res.json(storage_log);
};

exports.getStorageLogById = async (req, res) => {
    try {
        const { type, id } = req.params;

        if(type != "log")return

        const storage_Logs = await StorageLog.findAll({where: {id_item: id}});

        if (!storage_Logs) {
            return res.status(404).json({ error: "log do item não encontrado: " + id });
        }

        res.json(storage_Logs);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.createStorageItem = async (req, res) => {
    let item = req.body;

    item = {
        ...item,
        created_by: req.user?.id || 1
    }

    let item_log = {
        ...item, 
        id_item: item.id
    }
    delete item_log[id]

    try {
        const storage = await Storage.create(item);

        await StorageLog.create(item_log);

        res.status(201).json(storage);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateStorageItem = async (req, res) => {
  const toUpdate = req.body;
  const { id } = req.params;

  toUpdate = {
    ...toUpdate,
    created_by: req.user?.id || 1
  }

  try {
    const storage = await Storage.findByPk(id);
    if (!storage) return res.status(404).json({ error: "Item não encontrado" });

    const fields = new Set([...Object.keys(storage), ...Object.keys(toUpdate)])

    let new_storage_log = {
        ...storage, 
        id_item: storage.id
    }
    delete new_storage_log[id]

    fields.forEach((field) => {
        if(storage[field] != toUpdate[field] && field != "id"){
            if(field === "amount"){
                const value_diference = toUpdate[field] - storage[field]
                new_storage_log[value_diference] = value_diference
            } else {
                new_storage_log[value_diference] = 0
            }

            new_storage_log[last_change] = field
        }
    });

    await storage.update(toUpdate);
    await StorageLog.create(new_storage_log);

    const updated = await Storage.findByPk(id);

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteStorageItem = async (req, res) => {
  try {
    const storage = await Storage.findByPk(req.params.id);

    if (!storage) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    let item_log = {
        ...storage, 
        id_item: storage.id,
        created_by: req.user?.id || 1
    }
    delete item_log[id]

    await storage.destroy();
    await StorageLog.create(item_log);

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 