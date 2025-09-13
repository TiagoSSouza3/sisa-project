const Storage = require('../models/Storage');
const StorageLog = require('../models/StorageLog');
const { Op, fn, col, where } = require('sequelize');

exports.getStorage = async (req, res) => {
  try {
    const storage = await Storage.findAll();
    
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
    order: [[ 'created_at', 'DESC' ]]
  });
  res.json(storage_log);
};

exports.getStorageLogByMonth = async (req, res) => {
  if (req.params.type !== "log") return;

  const { month, year } = req.body;

  try {
    const storage_log = await StorageLog.findAll({
      where: where(fn('MONTH', col('created_at')), month),
      where: where(fn('YEAR', col('created_at')), year),
      order: [['created_at', 'DESC']]
    });

    res.json(storage_log);
  } catch (error) {
    console.error("Erro ao buscar storage log:", error);
    res.status(500).json({ error: "Erro ao buscar storage log" });
  }
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
            created_at: new Date(),
            updated_at: new Date()
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

    // Verifica mudanças e cria logs separados para cada tipo de mudança
    const logsToCreate = [];
    
    // Verifica mudança de preço
    if (toUpdate.last_price !== undefined && storage.last_price !== toUpdate.last_price) {
      const priceLog = {
        id_item: storage.id,
        name: storage.name,
        description: storage.description,
        last_price: toUpdate.last_price, // Novo preço
        last_price_date: toUpdate.last_price_date || storage.last_price_date,
        amount: storage.amount, // Quantidade atual
        created_by: req.user?.id || 1,
        created_at: new Date(),
        last_change: "price_update",
        value_diference: 0
      };
      logsToCreate.push(priceLog);
    }

    // Verifica mudança de quantidade (entrada de estoque)
    if (toUpdate.amount !== undefined && storage.amount !== toUpdate.amount) {
      const amountDifference = toUpdate.amount - storage.amount;
      if (amountDifference > 0) { // Só registra entradas (compras)
        const amountLog = {
          id_item: storage.id,
          name: storage.name,
          description: storage.description,
          last_price: toUpdate.last_price !== undefined ? toUpdate.last_price : storage.last_price,
          last_price_date: toUpdate.last_price_date !== undefined ? toUpdate.last_price_date : storage.last_price_date,
          amount: storage.amount, // Quantidade anterior
          created_by: req.user?.id || 1,
          created_at: new Date(),
          last_change: "amount_increase",
          value_diference: amountDifference
        };
        logsToCreate.push(amountLog);
      }
    }

    // Verifica outras mudanças (nome, descrição, etc.)
    const otherFields = ['name', 'description'];
    otherFields.forEach(field => {
      if (toUpdate[field] !== undefined && storage[field] !== toUpdate[field]) {
        const otherLog = {
          id_item: storage.id,
          name: storage.name,
          description: storage.description,
          last_price: storage.last_price,
          last_price_date: storage.last_price_date,
          amount: storage.amount,
          created_by: req.user?.id || 1,
          created_at: new Date(),
          last_change: field + "_update",
          value_diference: 0
        };
        logsToCreate.push(otherLog);
      }
    });

    // Atualiza o item
    await storage.update(toUpdate);

    // Cria todos os logs necessários
    for (const log of logsToCreate) {
      await StorageLog.create(log);
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