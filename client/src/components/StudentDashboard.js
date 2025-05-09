// Fichier : client/src/components/StudentDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentDashboard.css';

const StudentDashboard = () => {
  const [uniqueLink, setUniqueLink] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uniqueLink) {
      setError('Veuillez entrer un lien d\'examen');
      return;
    }
    navigate(`/exam/${uniqueLink}`);
  };

  return (
    <div className="container-student"> 
    <div className="from-student">
      <h2>Espace Étudiant</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="from-etu" onSubmit={handleSubmit}>
        <div className="mb-6">
          <input
            type="text"
            className="form-stud"
            placeholder="Entrez le lien unique de l'examen"
            value={uniqueLink}
            onChange={(e) => setUniqueLink(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-etu">Rejoindre l'examen</button>
      </form>
    </div>
    </div>
  );
};

export default StudentDashboard;