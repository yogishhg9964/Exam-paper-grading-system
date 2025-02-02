import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-container">
      <div className="about-hero">
        <h1>About Smart Exam Grading</h1>
        <p>Revolutionizing the way educators grade exams with AI-powered solutions</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-robot"></i>
          </div>
          <h3>AI-Powered Grading</h3>
          <p>Our system uses advanced AI algorithms to ensure accurate and consistent grading across all submissions.</p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-clock"></i>
          </div>
          <h3>Time-Saving</h3>
          <p>Reduce grading time by up to 80% while maintaining high accuracy and detailed feedback.</p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <i className="fas fa-chart-bar"></i>
          </div>
          <h3>Detailed Analytics</h3>
          <p>Get comprehensive insights into student performance and identify areas for improvement.</p>
        </div>
      </div>

      <section className="about-features">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature">
            <i className="fas fa-check-circle"></i>
            <h4>Automated Grading</h4>
          </div>
          <div className="feature">
            <i className="fas fa-comments"></i>
            <h4>Detailed Feedback</h4>
          </div>
          <div className="feature">
            <i className="fas fa-file-alt"></i>
            <h4>Multiple Format Support</h4>
          </div>
          <div className="feature">
            <i className="fas fa-lock"></i>
            <h4>Secure Processing</h4>
          </div>
        </div>
      </section>

      <section className="about-team">
        <h2>Our Team</h2>
        <div className="team-grid">
          {/* Add team member cards here */}
        </div>
      </section>
    </div>
  );
}

export default About;
