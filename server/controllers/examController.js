// Fichier : server/controllers/examController.js
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Récupérer les examens d'un enseignant
exports.getExamsByTeacher = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const [exams] = await pool.query('SELECT * FROM exams WHERE enseignant_id = ?', [teacherId]);
    res.json(exams);
  } catch (error) {
    console.error('Erreur lors de la récupération des examens:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer un examen
exports.createExam = async (req, res) => {
  const { title, description, public_cible } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const unique_link = uuidv4();
    await pool.query(
      'INSERT INTO exams (title, description, public_cible, unique_link, enseignant_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, public_cibile, unique_link, teacherId]
    );

    res.status(201).json({ message: 'Examen créé', unique_link });
  } catch (error) {
    console.error('Erreur lors de la création de l\'examen:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un examen par lien unique
exports.getExamByLink = async (req, res) => {
  const { unique_link } = req.params;
  try {
    const [exam] = await pool.query('SELECT * FROM exams WHERE unique_link = ?', [unique_link]);
    if (exam.length === 0) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    const [questions] = await pool.query('SELECT * FROM questions WHERE exam_id = ?', [exam[0].id]);
    const parsedQuestions = questions.map((question) => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : [],
      bonne_reponse: question.bonne_reponse ? JSON.parse(question.bonne_reponse) : [],
    }));

    res.json({ exam: exam[0], questions: parsedQuestions });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'examen:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer les questions d'un examen
exports.getQuestionsByExam = async (req, res) => {
  const { examId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const [exam] = await pool.query('SELECT * FROM exams WHERE id = ? AND enseignant_id = ?', [examId, teacherId]);
    if (exam.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet examen' });
    }

    const [questions] = await pool.query('SELECT * FROM questions WHERE exam_id = ?', [examId]);
    const parsedQuestions = questions.map((question) => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : [],
      bonne_reponse: question.bonne_reponse ? JSON.parse(question.bonne_reponse) : [],
    }));

    res.json(parsedQuestions);
  } catch (error) {
    console.error('Erreur lors de la récupération des questions:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Ajouter une question
exports.addQuestion = async (req, res) => {
  const { exam_id, type, enonce, media, reponse_correcte, tolerance, options, bonne_reponse, note, duree } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [exam] = await pool.query('SELECT * FROM exams WHERE id = ? AND enseignant_id = ?', [exam_id, decoded.id]);
    if (exam.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet examen' });
    }

    const [result] = await pool.query(
      'INSERT INTO questions (exam_id, type, enonce, media, reponse_correcte, tolerance, options, bonne_reponse, note, duree) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [exam_id, type, enonce, media, reponse_correcte, tolerance, JSON.stringify(options), JSON.stringify(bonne_reponse), note, duree]
    );

    res.status(201).json({ message: 'Question ajoutée', id: result.insertId });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la question:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Modifier une question
exports.updateQuestion = async (req, res) => {
  const { questionId } = req.params;
  const { type, enonce, media, reponse_correcte, tolerance, options, bonne_reponse, note, duree } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const [question] = await pool.query('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (question.length === 0) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    const [exam] = await pool.query('SELECT * FROM exams WHERE id = ? AND enseignant_id = ?', [question[0].exam_id, teacherId]);
    if (exam.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet examen' });
    }

    await pool.query(
      'UPDATE questions SET type = ?, enonce = ?, media = ?, reponse_correcte = ?, tolerance = ?, options = ?, bonne_reponse = ?, note = ?, duree = ? WHERE id = ?',
      [type, enonce, media, reponse_correcte, tolerance, JSON.stringify(options), JSON.stringify(bonne_reponse), note, duree, questionId]
    );

    res.json({ message: 'Question modifiée' });
  } catch (error) {
    console.error('Erreur lors de la modification de la question:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Supprimer une question
exports.deleteQuestion = async (req, res) => {
  const { questionId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const teacherId = decoded.id;

    const [question] = await pool.query('SELECT * FROM questions WHERE id = ?', [questionId]);
    if (question.length === 0) {
      return res.status(404).json({ message: 'Question non trouvée' });
    }

    const [exam] = await pool.query('SELECT * FROM exams WHERE id = ? AND enseignant_id = ?', [question[0].exam_id, teacherId]);
    if (exam.length === 0) {
      return res.status(403).json({ message: 'Accès non autorisé à cet examen' });
    }

    await pool.query('DELETE FROM questions WHERE id = ?', [questionId]);
    res.json({ message: 'Question supprimée' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la question:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Soumettre un examen
exports.submitExam = async (req, res) => {
  const { unique_link, answers, geolocation } = req.body;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const [exam] = await pool.query('SELECT * FROM exams WHERE unique_link = ?', [unique_link]);
    if (exam.length === 0) {
      return res.status(404).json({ message: 'Examen non trouvé' });
    }

    const [questions] = await pool.query('SELECT id, type, reponse_correcte, bonne_reponse, note, explanation, correct_code FROM questions WHERE exam_id = ?', [exam[0].id]);
    let totalScore = 0;
    let maxScore = 0;
    const detailedResults = [];

    for (const question of questions) {
      const studentAnswer = answers[question.id] || (question.type === 'directe' ? '' : []);
      let score = 0;
      let isCorrect = false;

      if (question.type === 'directe') {
        if (studentAnswer && studentAnswer.toLowerCase() === question.reponse_correcte.toLowerCase()) {
          score = question.note;
          isCorrect = true;
        }
      } else {
        const correctAnswers = JSON.parse(question.bonne_reponse || '[]');
        if (studentAnswer && JSON.stringify(studentAnswer.sort()) === JSON.stringify(correctAnswers.sort())) {
          score = question.note;
          isCorrect = true;
        }
      }

      totalScore += score;
      maxScore += question.note;

      await pool.query(
        'INSERT INTO student_answers (student_id, exam_id, question_id, reponse, score_obtenu, geolocation) VALUES (?, ?, ?, ?, ?, POINT(?, ?))',
        [studentId, exam[0].id, question.id, JSON.stringify(studentAnswer), score, geolocation.lat, geolocation.lng]
      );

      detailedResults.push({
        question_id: question.id,
        type: question.type,
        student_answer: studentAnswer,
        correct_answer: question.type === 'directe' ? question.reponse_correcte : question.bonne_reponse,
        is_correct: isCorrect,
        score: score,
        max_score: question.note,
        correct_code: question.correct_code || null,
      });
    }

    // Enregistrez le score total
    await pool.query(
      'INSERT INTO exam_results (exam_id, student_id, score, max_score) VALUES (?, ?, ?, ?)',
      [exam[0].id, studentId, totalScore, maxScore]
    );

    res.json({
      score: totalScore,
      max_score: maxScore,
      percentage: ((totalScore / maxScore) * 100).toFixed(2),
      detailed_results: detailedResults,
    });
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'examen:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Apportez les résultats de l'examen
exports.getExamResults = async (req, res) => {
  const { examId } = req.params;
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token requis' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const studentId = decoded.id;

    const [results] = await pool.query(
      'SELECT score, max_score FROM exam_results WHERE exam_id = ? AND student_id = ?',
      [examId, studentId]
    );
    if (results.length === 0) {
      return res.status(404).json({ message: 'Résultats non trouvés' });
    }

    const [questions] = await pool.query(
      'SELECT id, type, reponse_correcte, bonne_reponse, note, explanation, correct_code FROM questions WHERE exam_id = ?',
      [examId]
    );

    const [studentAnswers] = await pool.query(
      'SELECT question_id, reponse, score_obtenu FROM student_answers WHERE exam_id = ? AND student_id = ?',
      [examId, studentId]
    );

    const detailedResults = questions.map((question) => {
      const studentAnswerRecord = studentAnswers.find((ans) => ans.question_id === question.id);
      const studentAnswer = studentAnswerRecord ? JSON.parse(studentAnswerRecord.reponse) : null;
      const isCorrect = studentAnswerRecord ? studentAnswerRecord.score_obtenu > 0 : false;

      return {
        question_id: question.id,
        type: question.type,
        student_answer: studentAnswer,
        correct_answer: question.type === 'directe' ? question.reponse_correcte : question.bonne_reponse,
        is_correct: isCorrect,
        score: studentAnswerRecord ? studentAnswerRecord.score_obtenu : 0,
        max_score: question.note,
        correct_code: question.correct_code || null,
      };
    });

    res.json({
      score: results[0].score,
      max_score: results[0].max_score,
      percentage: ((results[0].score / results[0].max_score) * 100).toFixed(2),
      detailed_results: detailedResults,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
