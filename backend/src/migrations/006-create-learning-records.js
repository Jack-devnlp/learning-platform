module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('learning_records', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      startTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: true
      },
      progress: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      scrollData: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('not_started', 'in_progress', 'completed', 'overdue'),
        defaultValue: 'not_started'
      },
      totalTime: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.dropTable('learning_records');
  }
};
