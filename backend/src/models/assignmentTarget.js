module.exports = (sequelize, DataTypes) => {
  const AssignmentTarget = sequelize.define('AssignmentTarget', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    assignmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Assignments',
        key: 'id'
      }
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    targetType: {
      type: DataTypes.ENUM('user', 'department'),
      allowNull: false
    }
  }, {
    tableName: 'assignment_targets',
    timestamps: true
  });

  AssignmentTarget.associate = (models) => {
    AssignmentTarget.belongsTo(models.Assignment, { foreignKey: 'assignmentId' });
  };

  return AssignmentTarget;
};
