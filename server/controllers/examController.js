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