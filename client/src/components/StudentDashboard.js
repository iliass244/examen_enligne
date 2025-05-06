// Fichier : client/src/components/StudentDashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="container mt-5">
      <h2>Espace Étudiant</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Entrez le lien unique de l'examen"
            value={uniqueLink}
            onChange={(e) => setUniqueLink(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Rejoindre l'examen</button>
      </form>
    </div>
  );
};

export default StudentDashboard;