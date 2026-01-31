module.exports = (sequelize, DataTypes) => {
  const Quiz = sequelize.define('Quiz', {
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
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of option strings'
    },
    correctAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Index of correct answer in options array'
    }
  }, {
    tableName: 'quizzes',
    timestamps: true
  });

  Quiz.associate = (models) => {
    Quiz.belongsTo(models.Assignment, { foreignKey: 'assignmentId' });
    Quiz.hasMany(models.QuizAnswer, { foreignKey: 'quizId' });
  };

  return Quiz;
};
