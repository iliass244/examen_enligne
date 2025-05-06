// Fichier : client/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    date_naissance: '',
    sexe: '',
    etablissement: '',
    filiere: '',
    role: 'etudiant',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Inscription réussie ! Veuillez vous connecter.');
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Inscription</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Mot de passe"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="nom"
            className="form-control"
            placeholder="Nom"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="prenom"
            className="form-control"
            placeholder="Prénom"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="date"
            name="date_naissance"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <select name="sexe" className="form-control" onChange={handleChange} required>
            <option value="">Sélectionner le sexe</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="etablissement"
            className="form-control"
            placeholder="Établissement"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="filiere"
            className="form-control"
            placeholder="Filière"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <select name="role" className="form-control" onChange={handleChange} required>
            <option value="etudiant">Étudiant</option>
            <option value="enseignant">Enseignant</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">S'inscrire</button>
      </form>
    </div>
  );
};

export default Register;
