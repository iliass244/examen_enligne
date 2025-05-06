// Fichier : server/controllers/authController.js
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Inscription
exports.register = async (req, res) => {
  const { email, password, nom, prenom, date_naissance, sexe, etablissement, filiere, role } = req.body;
  try {
    if (!email || !password || !nom || !prenom || !date_naissance || !sexe || !etablissement || !filiere || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (email, password, nom, prenom, date_naissance, sexe, etablissement, filiere, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, nom, prenom, date_naissance, sexe, etablissement, filiere, role]
    );

    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Connexion
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (user.length === 0) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isMatch = await bcrypt.compare(password, user[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user[0].id, role: user[0].role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ message: 'Connexion réussie', token, role: user[0].role });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};