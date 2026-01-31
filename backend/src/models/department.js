module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Departments',
        key: 'id'
      }
    }
  }, {
    tableName: 'departments',
    timestamps: true
  });

  Department.associate = (models) => {
    Department.hasMany(models.User, { foreignKey: 'departmentId' });
    Department.belongsTo(models.Department, { as: 'parent', foreignKey: 'parentId' });
    Department.hasMany(models.Department, { as: 'children', foreignKey: 'parentId' });
  };

  return Department;
};
