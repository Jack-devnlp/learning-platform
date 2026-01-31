module.exports = (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    documentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Documents',
        key: 'id'
      }
    },
    requiredTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Required learning time in minutes'
    },
    hasQuiz: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdBy: {
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
    tableName: 'assignments',
    timestamps: true
  });

  Assignment.associate = (models) => {
    Assignment.belongsTo(models.Document, { foreignKey: 'documentId' });
    Assignment.belongsTo(models.User, { as: 'creator', foreignKey: 'createdBy' });
    Assignment.hasMany(models.AssignmentTarget, { foreignKey: 'assignmentId' });
    Assignment.hasMany(models.LearningRecord, { foreignKey: 'assignmentId' });
    Assignment.hasMany(models.Quiz, { foreignKey: 'assignmentId' });
  };

  return Assignment;
};
