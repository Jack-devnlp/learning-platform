module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignment_targets', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      assignmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'assignments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      targetId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      targetType: {
        type: Sequelize.ENUM('user', 'department'),
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assignment_targets');
  }
};
