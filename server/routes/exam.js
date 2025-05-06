// Fichier : server/routes/exam.js
const express = require('express');
const router = express.Router();
const { getExamsByTeacher, createExam } = require('../controllers/examController');

router.get('/me', getExamsByTeacher);
router.post('/', createExam);

module.exports = router;