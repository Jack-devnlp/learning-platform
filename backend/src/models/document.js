module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    fileType: {
      type: DataTypes.ENUM('pdf', 'word', 'video'),
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    uploaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'documents',
    timestamps: true
  });

  Document.associate = (models) => {
    Document.belongsTo(models.User, { as: 'uploader', foreignKey: 'uploaderId' });
    Document.hasMany(models.Assignment, { foreignKey: 'documentId' });
  };

  return Document;
};
