// Fichier : server/routes/exam.js
const express = require('express');
const router = express.Router();
const { getExamsByTeacher, createExam, getQuestionsByExam, addQuestion, updateQuestion, deleteQuestion } = require('../controllers/examController');

router.get('/me', getExamsByTeacher);
router.post('/', createExam);
router.get('/:examId/questions', getQuestionsByExam);
router.post('/questions', addQuestion);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);

module.exports = router;