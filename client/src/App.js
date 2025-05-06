// Fichier : client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import ExamQuestions from './components/ExamQuestions';
import 'bootstrap/dist/css/bootstrap.min.css';
import CreateExam from './components/CreateExam';



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />     
        <Route path="/create-exam" element={<CreateExam />} />
        <Route path="/exam/:examId/questions" element={<ExamQuestions />} />
      </Routes>
    </Router>
  );
};

export default App;
