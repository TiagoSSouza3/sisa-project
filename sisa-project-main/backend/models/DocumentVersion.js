const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const DocumentVersion = sequelize.define('DocumentVersion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    document_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'documents',
            key: 'id'
        }
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    content: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    modified_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    modification_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    change_description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'document_versions',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['document_id', 'version']
        }
    ]
});

// Definindo as associações
DocumentVersion.associate = (models) => {
    DocumentVersion.belongsTo(models.Document, {
        foreignKey: 'document_id',
        as: 'document'
    });
    DocumentVersion.belongsTo(models.User, {
        foreignKey: 'modified_by',
        as: 'modifier'
    });
};

module.exports = DocumentVersion; 