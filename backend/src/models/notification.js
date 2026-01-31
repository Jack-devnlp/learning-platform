module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM('new_assignment', 'deadline_reminder', 'system'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Related entity ID (e.g., assignmentId)'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'notifications',
    timestamps: true
  });

  Notification.associate = (models) => {
    Notification.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return Notification;
};
