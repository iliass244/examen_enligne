// Fichier : client/src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';



  const Home = () => {
    return (
        <div className="home-container">
             <section className="hero-section">
            <h1>Bienvenue sur ExamOnline</h1>
            <p>La plateforme idéale pour créer, gérer et passer des examens en ligne en toute simplicité.</p>
            <div className="hero-actions">
             <Link to="/login" className="btn btn-primary sign-in-btn">
                Se connecter
            </Link>
             <Link to="/register" className="btn btn-secondary sign-up-btn">
              S'inscrire
             </Link>
        </div>
      </section>
      {/* قسم المميزات */}
      <section className="features-section">
        <h2>Pourquoi choisir ExamOnline ?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="fas fa-chalkboard-teacher"></i>
            <h3>Gestion facile</h3>
            <p>Créez et gérez vos examens en quelques clics, avec une interface intuitive.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-user-graduate"></i>
            <h3>Accessibilité</h3>
            <p>Permettez à vos étudiants de passer les examens depuis n'importe où, à tout moment.</p>
          </div>
          <div className="feature-card">
            <i className="fas fa-shield-alt"></i>
            <h3>Sécurité</h3>
            <p>Vos données et examens sont protégés avec un système sécurisé.</p>
          </div>
        </div>
      </section>

      {/* قسم دعوة للعمل */}
      <section className="cta-section">
        <h2>Prêt à commencer ?</h2>
        <p>Rejoignez des milliers d'enseignants et d'étudiants sur ExamOnline dès aujourd'hui !</p>
        <Link to="/register" className="btn btn-primary cta-btn">
          Créer un compte
        </Link>
      </section>
    </div>
  );
};

export default Home;