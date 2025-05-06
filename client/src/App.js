// Fichier : client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import CreateExam from './components/CreateExam';
import 'bootstrap/dist/css/bootstrap.min.css';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-exam" element={<CreateExam />} />
      </Routes>
    </Router>
  );
};

export default App;
