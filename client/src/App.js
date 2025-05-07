// Fichier : client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import TeacherDashboard from './components/TeacherDashboard';
import CreateExam from './components/CreateExam';
import ExamQuestions from './components/ExamQuestions';
import StudentDashboard from './components/StudentDashboard';
import Exam from './components/Exam';
import ExamResults from './components/ExamResults';
import 'bootstrap/dist/css/bootstrap.min.css';



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
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/exam/:unique_link" element={<Exam />} />
        <Route path="/exam/:examId/results" element={<ExamResults />} />
      </Routes>
    </Router>
  );
};

export default App;
