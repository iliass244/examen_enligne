// Fichier : client/src/components/ExamResults.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ExamResults.css';

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchResults = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/exams/${examId}/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erreur lors de la récupération des résultats');
      }
    };

    fetchResults();
  }, [examId, navigate]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!results) {
    return <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Chargement...</span></div>;
  }

  return (
    <div className="exam-results-container">
      <h2>Résultats de l'examen</h2>
      <div className="results-summary">
        <p><strong>Score obtenu :</strong> {results.score} / {results.max_score}</p>
        <p><strong>Pourcentage :</strong> {results.percentage}%</p>
      </div>
      <h3>Détails des réponses</h3>
      <div className="questions-list">
        {results.detailed_results.map((result, index) => (
          <div key={result.question_id} className={`question-item ${result.is_correct ? 'correct' : 'incorrect'}`}>
            <h4>Question {index + 1}</h4>
            <p><strong>Type :</strong> {result.type === 'directe' ? 'Réponse directe' : 'QCM'}</p>
            <p><strong>Votre réponse :</strong> {result.student_answer ? (Array.isArray(result.student_answer) ? result.student_answer.join(', ') : result.student_answer) : 'Aucune réponse'}</p>
            <p><strong>Réponse correcte :</strong> {result.correct_answer}</p>
            <p><strong>Résultat :</strong> {result.is_correct ? 'Correct' : 'Incorrect'}</p>
            <p><strong>Points :</strong> {result.score} / {result.max_score}</p>
            
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default ExamResults;