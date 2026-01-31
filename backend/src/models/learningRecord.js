module.exports = (sequelize, DataTypes) => {
  const LearningRecord = sequelize.define('LearningRecord', {
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
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Assignments',
        key: 'id'
      }
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Progress percentage 0-100'
    },
    scrollData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of viewed percentage ranges'
    },
    status: {
      type: DataTypes.ENUM('not_started', 'in_progress', 'completed', 'overdue'),
      defaultValue: 'not_started'
    },
    totalTime: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total learning time in seconds'
    }
  }, {
    tableName: 'learning_records',
    timestamps: true
  });

  LearningRecord.associate = (models) => {
    LearningRecord.belongsTo(models.User, { foreignKey: 'userId' });
    LearningRecord.belongsTo(models.Assignment, { foreignKey: 'assignmentId' });
  };

  return LearningRecord;
};
