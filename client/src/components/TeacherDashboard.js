// Fichier : client/src/components/TeacherDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get('http://localhost:5000/api/exams/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setExams(response.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des examens');
        console.error('Erreur:', err.response?.data);
      });
  }, [navigate]);

  return (
    <div className="container-teacher">
    <div className="from-teacher">
      <h2>Espace Enseignant</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <Link to="/create-exam" className="btn-cree">
        Créer un nouvel examen
      </Link>
      </div>
      <h3 className="titre-examen">Vos examens</h3>
      {exams.length === 0 ? (
        <p>Aucun examen pour le moment</p>
      ) : (
        <ul className="list-group">
          {exams.map((exam) => (
            <li key={exam.id} className="list-group-item">
              <h3>{exam.title}</h3>
              <h6>{exam.public_cible}</h6>
              <p>{exam.description}</p>
              <Link to={`/exam/${exam.id}/questions`} className="btn btn-secondary">
                Gérer les questions
              </Link>
              <p>Lien unique: {exam.unique_link}</p>
            </li>
          ))}
        </ul>
      )}
    
    </div>
  );
};

export default TeacherDashboard;