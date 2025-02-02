const PyPDF2 = require('pypdf2');
const fs = require('fs');

function extract_text_from_pdf(pdf_path) {
  return new Promise((resolve, reject) => {
    fs.readFile(pdf_path, (err, data) => {
      if (err) return reject(err);
      const reader = new PyPDF2.PdfReader(data);
      let text = "";
      for (const page of reader.pages) {
        text += page.extract_text();
      }
      resolve(text);
    });
  });
}

function parse_questions(text) {
  const question_pattern = /(\d+\.\d+|\d+[a-z])\s*(.*?)\s*(\d{2})\s*\d\s*\d/gs;
  const matches = [...text.matchAll(question_pattern)];
  return matches.map(match => ({
    question_number: match[1].trim(),
    question_text: match[2].trim(),
    marks: match[3].trim()
  }));
}

function parse_answers(text) {
  const answer_pattern = /(\d+\.\d+|\d+[a-z])\s*(.*?)\s*(\d{2})\s*\d\s*\d/gs;
  const matches = [...text.matchAll(answer_pattern)];
  const answers = {};
  matches.forEach(match => {
    answers[match[1]] = match[2].trim();
  });
  return answers;
}

module.exports = { extract_text_from_pdf, parse_questions, parse_answers };