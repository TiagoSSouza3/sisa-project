const { DataTypes } = require("sequelize");
const sequelize = require("../config");

const Document = sequelize.define("document", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    template_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'document_templates',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    file_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file_type: {
        type: DataTypes.STRING,
        allowNull: true
    },
    file_data: {
        type: DataTypes.BLOB("long"),
        allowNull: true
    },
    content: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft',
        allowNull: false
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    last_modified_by: {
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
    tableName: 'documents',
    timestamps: true
});

// Definindo as associações
Document.associate = (models) => {
    Document.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject'
    });
    Document.belongsTo(models.DocumentTemplate, {
        foreignKey: 'template_id',
        as: 'template'
    });
    Document.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
    });
    Document.belongsTo(models.User, {
        foreignKey: 'last_modified_by',
        as: 'lastModifier'
    });
    Document.hasMany(models.DocumentVersion, {
        foreignKey: 'document_id',
        as: 'versions'
    });
};

module.exports = Document;
