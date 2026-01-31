module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assignments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      documentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'documents',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      requiredTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      hasQuiz: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deadline: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive'),
        defaultValue: 'active'
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
    await queryInterface.dropTable('assignments');
  }
};
