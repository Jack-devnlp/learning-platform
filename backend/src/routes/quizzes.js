const express = require('express');
const { body } = require('express-validator');
const { Quiz, QuizAnswer, Assignment, LearningRecord } = require('../models');
const { auth, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

// GET /api/quizzes/assignment/:assignmentId
router.get('/assignment/:assignmentId', auth, async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      where: { assignmentId: req.params.assignmentId }
    });

    const answers = await QuizAnswer.findAll({
      where: {
        userId: req.user.id,
        quizId: quizzes.map(q => q.id)
      }
    });

    const answeredQuizIds = answers.map(a => a.quizId);

    res.json({
      quizzes: quizzes.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        answered: answeredQuizIds.includes(q.id)
      })),
      hasSubmitted: answers.length > 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quizzes' });
  }
});

// POST /api/quizzes (Admin create quiz)
router.post('/',
  auth,
  requireAdmin,
  validate([
    body('assignmentId').notEmpty(),
    body('question').notEmpty(),
    body('options').isArray({ min: 2 }),
    body('correctAnswer').isInt()
  ]),
  async (req, res) => {
    try {
      const quiz = await Quiz.create(req.body);
      res.status(201).json({ quiz });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  }
);

// DELETE /api/quizzes/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    await quiz.destroy();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// POST /api/quizzes/submit
router.post('/submit', auth, async (req, res) => {
  try {
    const { assignmentId, answers } = req.body;

    const quizzes = await Quiz.findAll({
      where: { assignmentId }
    });

    let correctCount = 0;
    const answerRecords = [];

    for (const answer of answers) {
      const quiz = quizzes.find(q => q.id === answer.quizId);
      if (quiz) {
        const isCorrect = answer.answer === quiz.correctAnswer;
        if (isCorrect) correctCount++;
        answerRecords.push({
          userId: req.user.id,
          quizId: answer.quizId,
          answer: answer.answer,
          isCorrect
        });
      }
    }

    await QuizAnswer.bulkCreate(answerRecords);

    const score = Math.round((correctCount / quizzes.length) * 100);

    res.json({
      score,
      correctCount,
      totalCount: quizzes.length,
      answers: answerRecords
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit answers' });
  }
});

module.exports = router;
