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