import React, { useState, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Help from './components/Help';
import About from './components/About';
import axios from 'axios';
import './App.css';

function App() {
  const [questions, setQuestions] = useState(null);
  const [expectedAnswers, setExpectedAnswers] = useState(null);
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [gradingResults, setGradingResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const hiddenFileInput = useRef(null);

  const handleFileUpload = async (event, endpoint) => {
    const file = event.target.files[0];
    if (!file) {
      setError('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`http://localhost:5000/upload/${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (endpoint === 'questions') {
        setQuestions(response.data.message);
      } else if (endpoint === 'expected_answers') {
        setExpectedAnswers(response.data.message);
      } else if (endpoint === 'student_answers_image') {
        setStudentAnswers((prev) => [...prev, response.data.student_answers]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to process file. Please ensure the file is valid.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeAnswers = async () => {
    setLoading(true);
    setError('');
    setGradingResults([]); // Reset grading results

    try {
      const response = await axios.get('http://localhost:5000/grade');

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setGradingResults(response.data.results);
      }
    } catch (error) {
      console.error('Error grading answers:', error);
      setError('Failed to grade answers. Please ensure all files are uploaded.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoreClick = () => {
    hiddenFileInput.current.click();
  };

  const calculateTotalMarks = () => {
    let totalMarksObtained = 0;
    let totalMaxMarks = 100;

    gradingResults.forEach(result => {
      totalMarksObtained += result.marks_awarded;
      //totalMaxMarks += result.total_marks;
    });

    return { totalMarksObtained, totalMaxMarks };
  };

  const { totalMarksObtained, totalMaxMarks } = calculateTotalMarks();
  const finalFeedback = `Total Marks Obtained: ${totalMarksObtained} out of ${totalMaxMarks}`;

  return (
    <Router>
      <div className="App">
        <div className="sidebar">
          <div className="sidebar-header">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h2>Smart Grading</h2>
          </div>
          <nav className="sidebar-nav">
            <Link to="/" className={window.location.pathname === '/' ? 'active' : ''}>
              <i className="fas fa-home"></i> Dashboard
            </Link>
            <Link to="/upload" className={window.location.pathname === '/upload' ? 'active' : ''}>
              <i className="fas fa-upload"></i> Upload Files
            </Link>
            <Link to="/about" className={window.location.pathname === '/about' ? 'active' : ''}>
              <i className="fas fa-info-circle"></i> About
            </Link>
            <Link to="/help" className={window.location.pathname === '/help' ? 'active' : ''}>
              <i className="fas fa-question-circle"></i> Help
            </Link>
          </nav>
        </div>

        <div className="main-content">
          <header className="top-header">
            <div className="header-content">
              <h1>Smart Exam Grading System</h1>
              <p>AI-powered grading solution for educators</p>
            </div>
            <div className="user-profile">
              <i className="fas fa-user-circle"></i>
              <span>Admin</span>
            </div>
          </header>

          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/help" element={<Help />} />
            <Route path="/upload" element={
              <div className="container">
                <div className="upload-section">
                  <h3>Upload Questions PDF</h3>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'questions')} />
                  {questions && <p className="success-message">{questions}</p>}
                </div>

                <div className="upload-section">
                  <h3>Upload Expected Answers PDF</h3>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'expected_answers')} />
                  {expectedAnswers && <p className="success-message">{expectedAnswers}</p>}
                </div>

                <div className="upload-section">
                  <h3>Upload Student Answers Image</h3>
                  <input type="file" onChange={(e) => handleFileUpload(e, 'student_answers_image')} />
                  <button className="secondary-btn" onClick={handleAddMoreClick}>
                    Upload More
                  </button>
                  <input
                    ref={hiddenFileInput}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(e, 'student_answers_image')}
                  />
                  {studentAnswers.length > 0 && <p className="success-message">{studentAnswers.length} images uploaded</p>}
                </div>

                <div className="grade-button-container">
                  <button 
                    className="grade-button" 
                    onClick={handleGradeAnswers} 
                    disabled={loading || !questions || !expectedAnswers || studentAnswers.length === 0}
                  >
                    {loading ? (
                      <><i className="fas fa-spinner fa-spin"></i> Grading...</>
                    ) : (
                     <>Grade Answers <i className="fas fa-check-circle"></i></>
                    )}
                  </button>
                  {error && <div className="error-toast">{error}</div>}
                </div>

                {gradingResults.length > 0 && (
                  <div className="results-section">
                    <h2>Grading Results</h2>
                    <div className="results-table">
                      <table>
                        <thead>   
                          <tr>
                            <th>Question</th>
                            <th>Marks Awarded</th>
                            <th>Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gradingResults.map((result, index) => (
                            <tr key={index}>
                              <td>{result.question_number}</td>
                              <td>{result.marks_awarded}</td>
                              <td>{result.feedback}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="final-feedback">
                      <h3>Final Feedback</h3>
                      <p>{finalFeedback}</p>
                    </div>
                  </div>
                )}
              </div>
            } />
            <Route path="/" element={
              <div className="dashboard-container">
                <div className="welcome-banner">
                  <h1>Welcome to Smart Exam Grading</h1>
                  <p>Get started by uploading your exam files</p>
                  <Link to="/upload" className="cta-button">
                    Start Grading <i className="fas fa-arrow-right"></i>
                  </Link>
                </div>
                <div className="features-grid">
                  <div className="feature-card">
                    <i className="fas fa-rocket"></i>
                    <h3>Fast Processing</h3>
                    <p>Grade multiple papers in minutes</p>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-brain"></i>
                    <h3>AI-Powered</h3>
                    <p>Advanced algorithms for accurate grading</p>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-chart-line"></i>
                    <h3>Detailed Analytics</h3>
                    <p>Comprehensive performance insights</p>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;