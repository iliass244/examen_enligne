/ Fichier : client/src/components/ExamQuestions.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/ExamQuestions.css';

const ExamQuestions = () => {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [formMode, setFormMode] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'directe',
    enonce: '',
    media: '',
    reponse_correcte: '',
    tolerance: 0,
    options: ['', '', '', ''],
    bonne_reponse: [],
    note: 0,
    duree: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios
      .get(`http://localhost:5000/api/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setQuestions(response.data);
      })
      .catch((err) => setError(err.response?.data?.message || 'Erreur lors de la récupération des questions'));
  }, [examId, navigate]);

  const handleEdit = (question) => {
    setFormMode('edit');
    setEditingQuestionId(question.id);
    setFormData({
      type: question.type,
      enonce: question.enonce,
      media: question.media || '',
      reponse_correcte: question.reponse_correcte || '',
      tolerance: question.tolerance || 0,
      options: question.options && question.options.length ? [...question.options, ...Array(4 - question.options.length).fill('')] : ['', '', '', ''],
      bonne_reponse: question.bonne_reponse || [],
      note: question.note,
      duree: question.duree,
    });
  };

  const handleAdd = () => {
    setFormMode('add');
    setEditingQuestionId(null);
    setFormData({
      type: 'directe',
      enonce: '',
      media: '',
      reponse_correcte: '',
      tolerance: 0,
      options: ['', '', '', ''],
      bonne_reponse: [],
      note: 0,
      duree: 0,
    });
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette question ?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/exams/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestions(questions.filter((q) => q.id !== questionId));
      setError('');
      alert('Question supprimée avec succès !');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la suppression de la question');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'note' || name === 'duree' || name === 'tolerance' ? parseInt(value) || 0 : value,
    }));
  };

  const handleOptionsChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleBonneReponseChange = (option) => {
    const newBonneReponse = [...formData.bonne_reponse];
    if (newBonneReponse.includes(option)) {
      newBonneReponse.splice(newBonneReponse.indexOf(option), 1);
    } else {
      newBonneReponse.push(option);
    }
    setFormData((prev) => ({ ...prev, bonne_reponse: newBonneReponse }));
  };

  const validateForm = () => {
    if (!formData.enonce.trim()) {
      setError('L\'énoncé est requis');
      return false;
    }
    if (formData.note <= 0) {
      setError('La note doit être supérieure à 0');
      return false;
    }
    if (formData.duree <= 0) {
      setError('La durée doit être supérieure à 0');
      return false;
    }
    if (formData.type === 'directe' && !formData.reponse_correcte.trim()) {
      setError('La réponse correcte est requise pour une question directe');
      return false;
    }
    if (formData.type === 'qcm') {
      const validOptions = formData.options.filter((opt) => opt.trim()).length;
      if (validOptions < 2) {
        setError('Au moins 2 options valides sont requises pour un QCM');
        return false;
      }
      if (!formData.bonne_reponse.length) {
        setError('Au moins une bonne réponse est requise pour un QCM');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        options: formData.type === 'qcm' ? formData.options.filter((opt) => opt.trim()) : [],
        bonne_reponse: formData.type === 'qcm' ? formData.bonne_reponse : [],
        exam_id: parseInt(examId),
      };

      if (formMode === 'add') {
        const response = await axios.post(
          'http://localhost:5000/api/exams/questions',
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuestions([...questions, { ...payload, id: response.data.id }]);
        alert('Question ajoutée avec succès !');
      } else if (formMode === 'edit') {
        const response = await axios.put(
          `http://localhost:5000/api/exams/questions/${editingQuestionId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setQuestions(
          questions.map((q) =>
            q.id === editingQuestionId ? { ...q, ...payload } : q
          )
        );
        alert('Question modifiée avec succès !');
      }

      setFormMode(null);
      setFormData({
        type: 'directe',
        enonce: '',
        media: '',
        reponse_correcte: '',
        tolerance: 0,
        options: ['', '', '', ''],
        bonne_reponse: [],
        note: 0,
        duree: 0,
      });
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de l\'opération');
    }
  };

  return (
    <div className="exam-questions-container">
      <h2>Gestion des questions</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <button className="btn btn-primary add-question-btn" onClick={handleAdd}>
          Ajouter une question
        </button>
      </div>
      {questions.length === 0 ? (
        <p className="no-questions">Aucune question pour cet examen.</p>
      ) : (
        <ul className="list-group questions-list">
          {questions.map((question) => (
            <li key={question.id} className="list-group-item question-item">
              <div>
                <p><strong>Énoncé:</strong> {question.enonce}</p>
                <p><strong>Type:</strong> {question.type}</p>
                {question.type === 'qcm' && (
                  <>
                    <p><strong>Options:</strong> {question.options.join(', ')}</p>
                    <p><strong>Bonne(s) réponse(s):</strong> {question.bonne_reponse.join(', ')}</p>
                  </>
                )}
                {question.type === 'directe' && (
                  <p><strong>Réponse correcte:</strong> {question.reponse_correcte}</p>
                )}
                <p><strong>Note:</strong> {question.note}</p>
                <p><strong>Durée:</strong> {question.duree} secondes</p>
              </div>
              <div className="question-actions">
                <button
                  className="btn btn-warning btn-sm edit-btn"
                  onClick={() => handleEdit(question)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-danger btn-sm delete-btn"
                  onClick={() => handleDelete(question.id)}
                >
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formMode && (
        <div className="question-form">
          <h3>{formMode === 'add' ? 'Ajouter une question' : 'Modifier la question'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Type</label>
              <select
                name="type"
                className="form-select"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="directe">Directe</option>
                <option value="qcm">QCM</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Énoncé</label>
              <textarea
                name="enonce"
                className="form-control"
                value={formData.enonce}
                onChange={handleInputChange}
                required
              />
            </div>
            {formData.type === 'directe' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Réponse correcte</label>
                  <input
                    type="text"
                    name="reponse_correcte"
                    className="form-control"
                    value={formData.reponse_correcte}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tolérance</label>
                  <input
                    type="number"
                    name="tolerance"
                    className="form-control"
                    value={formData.tolerance}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            {formData.type === 'qcm' && (
              <>
                <div className="mb-3">
                  <label className="form-label">Options (4 maximum)</label>
                  {formData.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      className="form-control mb-2"
                      value={option}
                      onChange={(e) => handleOptionsChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="mb-3">
                  <label className="form-label">Bonne(s) réponse(s)</label>
                  {formData.options.map((option, index) => (
                    <div key={index} className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={formData.bonne_reponse.includes(option)}
                        onChange={() => handleBonneReponseChange(option)}
                      />
                      <label className="form-check-label">{option || `Option ${index + 1}`}</label>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label">Média (URL)</label>
              <input
                type="text"
                name="media"
                className="form-control"
                value={formData.media}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Note</label>
              <input
                type="number"
                name="note"
                className="form-control"
                value={formData.note}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Durée (secondes)</label>
              <input
                type="number"
                name="duree"
                className="form-control"
                value={formData.duree}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary submit-btn">
                {formMode === 'add' ? 'Ajouter' : 'Enregistrer'}
              </button>
              <button
                type="button"
                className="btn btn-secondary cancel-btn"
                onClick={() => setFormMode(null)}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ExamQuestions;