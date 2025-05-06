// Fichier : client/src/components/Exam.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Exam.css';

const Exam = () => {
  const { unique_link } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [geolocationActivated, setGeolocationActivated] = useState(false);
  const [geolocationError, setGeolocationError] = useState('');

  // طلب بيانات الامتحان
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`http://localhost:5000/api/exams/${unique_link}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setExam(response.data.exam);
        const parsedQuestions = response.data.questions.map((question) => ({
          ...question,
          options: typeof question.options === 'string' ? JSON.parse(question.options) : question.options || [],
          bonne_reponse: typeof question.bonne_reponse === 'string' ? JSON.parse(question.bonne_reponse) : question.bonne_reponse || [],
        }));
        setQuestions(parsedQuestions);
        if (parsedQuestions.length > 0) {
          setTimeLeft(parsedQuestions[0].duree);
        }
      })
      .catch((err) => setError(err.response?.data?.message || 'Erreur lors de la récupération de l\'examen'));
  }, [unique_link, navigate]);

  // إدارة المؤقت
  useEffect(() => {
    if (timeLeft > 0 && geolocationActivated && questions.length > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && geolocationActivated && questions.length > 0) {
      if (!answers[questions[currentQuestionIndex].id]) {
        setAnswers((prev) => ({
          ...prev,
          [questions[currentQuestionIndex].id]: questions[currentQuestionIndex].type === 'directe' ? '' : [],
        }));
      }
      handleNextQuestion();
    }
  }, [timeLeft, geolocationActivated, questions, currentQuestionIndex, answers]);

  // طلب تفعيل الجغرافيا
  const requestGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          localStorage.setItem('geolocation', JSON.stringify({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }));
          setGeolocationActivated(true);
          setGeolocationError('');
        },
        (err) => {
          let message = 'Veuillez activer la géolocalisation pour continuer l\'examen.';
          if (err.code === err.PERMISSION_DENIED) {
            message += ' Accédez aux paramètres du site pour réactiver l\'autorisation.';
          }
          setGeolocationError(message);
          setGeolocationActivated(false);
          console.error('Erreur de géolocalisation:', err);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setGeolocationError('La géolocalisation n\'est pas prise en charge par votre navigateur.');
      setGeolocationActivated(false);
    }
  };

  const handleAnswerChange = (e) => {
    setAnswers({ ...answers, [questions[currentQuestionIndex].id]: e.target.value });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimeLeft(questions[currentQuestionIndex + 1].duree);
    } else {
      submitExam();
    }
  };

  const submitExam = async () => {
    try {
      const token = localStorage.getItem('token');
      const geolocation = JSON.parse(localStorage.getItem('geolocation') || '{}');
      if (!geolocation.lat || !geolocation.lng) {
        setError('La géolocalisation est requise pour soumettre l\'examen.');
        return;
      }

      const completeAnswers = { ...answers };
      questions.forEach((question) => {
        if (!completeAnswers[question.id]) {
          completeAnswers[question.id] = question.type === 'directe' ? '' : [];
        }
      });

      await axios.post(
        'http://localhost:5000/api/exams/submit',
        { unique_link, answers: completeAnswers, geolocation },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/exam/${exam.id}/results`);
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la soumission de l\'examen');
      console.error('Erreur soumission:', error);
    }
  };

  if (!exam || questions.length === 0) {
    return <div className="container mt-5">Chargement...</div>;
  }

  if (!geolocationActivated) {
    return (
      <div className="container mt-5 text-center">
        <h2>Activer la géolocalisation</h2>
        <p>
          Pour commencer l'examen, vous devez activer la géolocalisation afin de vérifier votre position.
        </p>
        {geolocationError && <div className="alert alert-warning">{geolocationError}</div>}
        <button className="btn btn-primary" onClick={requestGeolocation}>
          Activer la géolocalisation
        </button>
        <p className="mt-3">
          Si la géolocalisation est bloquée, accédez aux paramètres du site via l'icône de verrouillage dans la barre d'adresse et autorisez l'accès à la localisation.
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="container mt-5">
      <h2>{exam.title}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <p>Temps restant: {timeLeft} secondes</p>
      <h4>Question {currentQuestionIndex + 1}</h4>
      <p>{currentQuestion.enonce}</p>
      {currentQuestion.media && (
        <img src={currentQuestion.media} alt="Média" className="img-fluid" />
      )}
      {currentQuestion.type === 'directe' ? (
        <input
          type="text"
          className="form-control"
          value={answers[currentQuestion.id] || ''}
          onChange={handleAnswerChange}
        />
      ) : (
        Array.isArray(currentQuestion.options) ? (
          currentQuestion.options.map((option, index) => (
            <div key={index} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                value={option}
                checked={answers[currentQuestion.id]?.includes(option) || false}
                onChange={(e) => {
                  const newAnswers = { ...answers };
                  if (!newAnswers[currentQuestion.id]) {
                    newAnswers[currentQuestion.id] = [];
                  }
                  if (e.target.checked) {
                    newAnswers[currentQuestion.id].push(option);
                  } else {
                    newAnswers[currentQuestion.id] = newAnswers[currentQuestion.id].filter((o) => o !== option);
                  }
                  setAnswers(newAnswers);
                }}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))
        ) : (
          <p>Erreur: Les options du QCM ne sont pas valides</p>
        )
      )}
      <button className="btn btn-primary mt-3" onClick={handleNextQuestion}>
        {currentQuestionIndex < questions.length - 1 ? 'Question suivante' : 'Soumettre l\'examen'}
      </button>
    </div>
  );
};

export default Exam;