import React from 'react';
import './Help.css';

function Help() {
  return (
    <div className="help-container">
      <h1>Help & Guidelines</h1>
      
      <section className="help-section">
        <h2>Getting Started</h2>
        <div className="help-card">
          <div className="help-icon">
            <i className="fas fa-file-upload"></i>
          </div>
          <div className="help-content">
            <h3>Upload Files</h3>
            <p>1. Upload the question paper PDF</p>
            <p>2. Upload the expected answers PDF</p>
            <p>3. Upload student answer sheets as images</p>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2>File Requirements</h2>
        <div className="help-card">
          <div className="help-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="help-content">
            <h3>Supported Formats</h3>
            <ul>
              <li>Questions: PDF format</li>
              <li>Expected Answers: PDF format</li>
              <li>Student Answers: JPG, PNG, or PDF</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2>Grading Process</h2>
        <div className="help-card">
          <div className="help-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="help-content">
            <h3>How it Works</h3>
            <ol>
              <li>The system extracts text from all uploaded files</li>
              <li>Compares student answers with expected answers</li>
              <li>Generates detailed feedback and marks</li>
              <li>Provides a comprehensive grading report</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="help-section">
        <h2>Need More Help?</h2>
        <div className="help-card">
          <div className="help-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <div className="help-content">
            <h3>Contact Support</h3>
            <p>Email: support@examgrading.com</p>
            <p>Phone: +1 (555) 123-4567</p>
            <button className="contact-btn">Contact Us</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Help;
