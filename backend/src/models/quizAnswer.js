module.exports = (sequelize, DataTypes) => {
  const QuizAnswer = sequelize.define('QuizAnswer', {
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
    quizId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Quizzes',
        key: 'id'
      }
    },
    answer: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'quiz_answers',
    timestamps: true
  });

  QuizAnswer.associate = (models) => {
    QuizAnswer.belongsTo(models.User, { foreignKey: 'userId' });
    QuizAnswer.belongsTo(models.Quiz, { foreignKey: 'quizId' });
  };

  return QuizAnswer;
};
