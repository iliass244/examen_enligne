// Fichier : server/routes/exam.js
const express = require('express');
const router = express.Router();
const { getExamsByTeacher, createExam, getExamByLink, getQuestionsByExam, addQuestion, updateQuestion, deleteQuestion, submitExam, getExamResults } = require('../controllers/examController');

router.get('/me', getExamsByTeacher);
router.post('/', createExam);
router.get('/:unique_link', getExamByLink);
router.get('/:examId/questions', getQuestionsByExam);
router.post('/questions', addQuestion);
router.put('/questions/:questionId', updateQuestion);
router.delete('/questions/:questionId', deleteQuestion);
router.post('/submit', submitExam);
router.get('/:examId/results', getExamResults);

module.exports = router;