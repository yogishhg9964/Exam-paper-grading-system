import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Results() {
  const location = useLocation();
  const { gradingResults } = location.state || {};

  if (!gradingResults) {
    return <div>No grading results found. Please go back and grade the answers.</div>;
  }

  // Data for the bar chart
  const chartData = {
    labels: Object.keys(gradingResults.grading_results),
    datasets: [
      {
        label: 'Marks Awarded',
        data: Object.values(gradingResults.grading_results).map((result) => result.marks_awarded),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Marks Awarded per Question',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10, // Adjust based on maximum marks per question
      },
    },
  };

  return (
    <div className="results-page">
      <h1>Grading Results</h1>

      {/* Question-wise Results */}
      <div className="grading-results">
        <h2>Question-wise Results</h2>
        {Object.entries(gradingResults.grading_results).map(([questionNumber, result]) => (
          <div key={questionNumber} className="question-result">
            <h3>Question {questionNumber}</h3>
            <p><strong>Marks Awarded:</strong> {result.marks_awarded}</p>
            <p><strong>Feedback:</strong> {result.feedback}</p>
          </div>
        ))}
      </div>

      {/* Final Feedback */}
      <div className="final-feedback">
        <h2>Final Feedback</h2>
        <p><strong>Total Obtained Marks:</strong> {gradingResults.final_feedback.total_obtained_marks}</p>
        <p><strong>Total Maximum Marks:</strong> {gradingResults.final_feedback.total_maximum_marks}</p>
        <p><strong>Feedback:</strong> {gradingResults.final_feedback.feedback}</p>
      </div>

      {/* Analytics and Graphs */}
      <div className="analytics-section">
        <h2>Performance Analysis</h2>
        <div className="chart-container">
          <Bar data={chartData} options={chartOptions} />
        </div>
        <div className="conclusions">
          <h3>Conclusions</h3>
          <ul>
            <li>The student scored <strong>{gradingResults.final_feedback.total_obtained_marks}</strong> out of <strong>{gradingResults.final_feedback.total_maximum_marks}</strong>.</li>
            <li>Areas for improvement: Focus on questions with lower marks.</li>
            <li>Strengths: Questions with full marks indicate strong understanding.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Results;