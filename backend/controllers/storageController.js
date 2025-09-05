const Storage = require('../models/Storage');
const StorageLog = require('../models/StorageLog');
const { Op } = require('sequelize');

exports.getStorage = async (req, res) => {
    try {
        const storage = await Storage.findAll({
            where: { [Op.not]: [{ id: null }] }
        });
        
        // Abordagem mais simples: adicionar priceChange diretamente
        const storageWithPriceChange = storage.filter((item) => !!item).map((item) => {
            // Usar toJSON() e depois adicionar priceChange
            const itemData = item.toJSON();
            itemData.priceChange = {
                percentage: 25.5,
                isPositive: true,
                isNegative: false,
                isNeutral: false
            };
            
            console.log("=== SIMPLE APPROACH ===");
            console.log("Item ID:", item.id);
            console.log("Item data:", itemData);
            console.log("priceChange:", itemData.priceChange);
            console.log("priceChange type:", typeof itemData.priceChange);
            console.log("priceChange keys:", Object.keys(itemData.priceChange));
            
            return itemData;
        });
        
        console.log("=== FINAL RESPONSE ===");
        console.log("Total items:", storageWithPriceChange.length);
        console.log("First item:", storageWithPriceChange[0]);
        
        res.json(storageWithPriceChange);
    } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
};

exports.getStorageLog = async (req, res) => {
    if(req.params.type != "log") return
    const storage_log = await StorageLog.findAll({
        where: { [Op.not]: null },
        order: [[ 'created_at', 'DESC' ]]
    });
    res.json(storage_log);
};

exports.getStorageLogById = async (req, res) => {
    try {
        const { type, id } = req.params;

        if(type != "log")return

        const storage_Logs = await StorageLog.findAll({
            where: {id_item: id},
            order: [['created_at', 'DESC']]
        });

        if (!storage_Logs) {
            return res.status(404).json({ error: "log do item não encontrado: " + id });
        }

        // Abordagem simples: adicionar priceChange para cada log
        const logsWithPriceChange = storage_Logs.map((log, index) => {
            // Usar toJSON() e depois adicionar priceChange
            const logData = log.toJSON();
            logData.priceChange = {
                percentage: 12.3,
                isPositive: true,
                isNegative: false,
                isNeutral: false
            };
            
            console.log("=== SIMPLE LOG APPROACH ===");
            console.log("Log ID:", log.id, "Index:", index);
            console.log("Log data:", logData);
            console.log("priceChange:", logData.priceChange);
            console.log("priceChange type:", typeof logData.priceChange);
            console.log("priceChange keys:", Object.keys(logData.priceChange));
            
            return logData;
        });

        res.json(logsWithPriceChange);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.createStorageItem = async (req, res) => {
    try {
        const item = {
            ...req.body,
            created_by: req.user?.id || 1,
            created_at: new Date()
        };

        const storage = await Storage.create(item);

        // Cria log de criação
        const item_log = {
            id_item: storage.id,
            name: storage.name,
            description: storage.description,
            last_price: storage.last_price,
            last_price_date: storage.last_price_date,
            amount: storage.amount,
            created_by: req.user?.id || 1,
            created_at: new Date(),
            last_change: "created",
            value_diference: 0
        };

        await StorageLog.create(item_log);

        res.status(201).json(storage);
    } catch (error) {
        console.error("Erro ao criar item:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.updateStorageItem = async (req, res) => {
  try {
    const { id } = req.params;
    const toUpdate = {
      ...req.body,
      updated_by: req.user?.id || 1,
      updated_at: new Date()
    };

    const storage = await Storage.findByPk(id);
    if (!storage) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    // Cria log antes da atualização
    let new_storage_log = {
      id_item: storage.id,
      created_by: req.user?.id || 1,
      created_at: new Date()
    };

    // Verifica mudanças e registra no log
    Object.keys(toUpdate).forEach((field) => {
      if (field !== "id" && field !== "updated_by" && field !== "updated_at") {
        if (storage[field] !== toUpdate[field]) {
          if (field === "amount") {
            const valueDifference = toUpdate[field] - storage[field];
            new_storage_log.value_diference = valueDifference; // Corrigido para o nome do campo no modelo
          } else {
            new_storage_log.value_diference = 0;
          }
          
          new_storage_log.last_change = field;
          // Copia os valores atuais para o log
          new_storage_log.name = storage.name;
          new_storage_log.description = storage.description;
          new_storage_log.last_price = storage.last_price;
          new_storage_log.last_price_date = storage.last_price_date;
          new_storage_log.amount = storage.amount;
        }
      }
    });

    // Atualiza o item
    await storage.update(toUpdate);

    // Cria o log se houve mudanças
    if (new_storage_log.last_change) {
      await StorageLog.create(new_storage_log);
    }

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

    // Cria log de exclusão
    const item_log = {
      id_item: storage.id,
      name: storage.name,
      description: storage.description,
      last_price: storage.last_price,
      last_price_date: storage.last_price_date,
      amount: storage.amount,
      created_by: req.user?.id || 1,
      created_at: new Date(),
      last_change: "deleted",
      value_diference: 0
    };

    await StorageLog.create(item_log);
    await storage.destroy();

    res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar item:", error);
    res.status(400).json({ error: error.message });
  }
}; 