const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const DocumentTemplate = sequelize.define('DocumentTemplate', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false
    },
    placeholders: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    placeholder_config: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {}
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'document_templates',
    timestamps: true
});

module.exports = DocumentTemplate; 