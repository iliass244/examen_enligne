// Fichier : client/src/components/CreateExam.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreateExam.css';

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    public_cible: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/exams', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Examen créé avec succès ! Lien: ' + response.data.unique_link);
      navigate('/teacher-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la création de l\'examen');
    }
  };

  return (
    <div className="container-createexame">
    <div className="from-create">
      <h2 className='titre-create'>Créer un examen</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <input
            type="text"
            name="title"
            className="create-from"
            placeholder="Titre de l'examen"
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-5">
          <textarea
            name="description"
            className="create-from"
            placeholder="Description"
            onChange={handleChange}
          />
        </div>
        <div className="mb-5">
          <input
            type="text"
            name="public_cible"
            className="create-from"
            placeholder="Public ciblé (ex: 2e année MIP, S4, groupe A)"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn-create">Créer</button>
      </form>
    </div>
    </div>
  );
};

export default CreateExam;