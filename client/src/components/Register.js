// Fichier : client/src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

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
    <div className="container-registre">
      <div className="register-from">
      <h2>Inscription</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className='from-register' onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            className="control-from"
            placeholder="Email"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="password"
            name="password"
            className="control-from"
            placeholder="Mot de passe"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="nom"
            className="control-from"
            placeholder="Nom"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="prenom"
            className="control-from"
            placeholder="Prénom"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="date"
            name="date_naissance"
            className="control-from"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <select name="sexe" className="control-from" onChange={handleChange} required>
            <option value="">Sélectionner le sexe</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="etablissement"
            className="control-from"
            placeholder="Établissement"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="text"
            name="filiere"
            className="control-from"
            placeholder="Filière"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          <select name="role" className="control-from"  onChange={handleChange} required>
            <option value="etudiant">Étudiant</option>
            <option value="enseignant">Enseignant</option>
          </select>
        </div>
        <button type="submit" className="Register-btn">S'inscrire</button>
      </form>
      </div>
    </div>
  );
};

export default Register;
