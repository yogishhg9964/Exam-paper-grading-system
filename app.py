from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import re
import os
import logging
import json
import google.generativeai as genai
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure logging
logging.basicConfig(level=logging.DEBUG)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure the Gemini API key for text extraction
EXTRACTION_API_KEY = "AIzaSyD4BwR665IRPJm60WgJYnn-PfmgmEgFm-0"  # For text extraction
genai.configure(api_key=EXTRACTION_API_KEY)

# Configure the OpenAI-compatible API for grading
GRADING_API_KEY = "1ee2d992-e959-4d9d-80d2-744f701e2480"  # Replace with your API key
GRADING_API_BASE_URL = "https://api.kluster.ai/v1"  # Base URL for the API

# Initialize OpenAI client for grading
grading_client = OpenAI(
    api_key=GRADING_API_KEY,
    base_url=GRADING_API_BASE_URL
)

# Global variables to store parsed data
questions_data = {}
expected_answers_data = {}
student_answers_data = {}

def extract_text_from_pdf(pdf_path):
    """Extracts text from a PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        logging.error(f"Error extracting text from PDF: {e}")
        raise

def extract_text_from_image(image_path):
    """Extracts text from an image using the Gemini model."""
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        with open(image_path, "rb") as image_file:
            image_data = image_file.read()
        response = model.generate_content(
            ["Extract the text from this image.", {"mime_type": "image/jpeg", "data": image_data}]
        )
        if response.text:
            return response.text
        else:
            return "No text detected."
    except Exception as e:
        logging.error(f"Error extracting text from image using Gemini: {e}")
        raise

def preprocess_text(text):
    """Preprocesses the extracted text to standardize its format."""
    text = re.sub(r'\s+', ' ', text)
    return text

def parse_questions(text):
    """Parses the extracted text to extract question numbers, questions, and marks."""
    try:
        question_pattern = re.compile(r'(\d+[a-z]+|\d+\.\d+)\s*(.*?)\s*(\d{2})\s*\d\s*\d', re.DOTALL)
        matches = question_pattern.findall(text)
        questions = {}
        for match in matches:
            questions[match[0].strip()] = {
                "question": match[1].strip(),
                "marks": int(match[2].strip())
            }
        return questions
    except Exception as e:
        logging.error(f"Error parsing questions: {e}")
        raise

def parse_answers(text):
    """Parses the extracted text to extract question numbers and answers."""
    try:
        answer_pattern = re.compile(r'(\d+[a-z]+|\d+\.\d+)\s*(.*?)\s*(?=\d+[a-z]+|\d+\.\d+|$)', re.DOTALL)
        matches = answer_pattern.findall(text)
        answers = {}
        for match in matches:
            answers[match[0].strip()] = match[1].strip()
        return answers
    except Exception as e:
        logging.error(f"Error parsing answers: {e}")
        raise

def save_to_file(filename, data, mode='w'):
    """Saves data to a text file."""
    try:
        with open(filename, mode) as file:
            file.write(data + "\n")
        logging.info(f"Data saved to {filename}")
    except Exception as e:
        logging.error(f"Error saving data to {filename}: {e}")

@app.route('/upload/questions', methods=['POST'])
def upload_questions():
    """Handles the upload of the questions PDF."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        global questions_data
        questions_data = {}

        questions_text = extract_text_from_pdf(file_path)
        questions_text = preprocess_text(questions_text)
        questions_data = parse_questions(questions_text)
        return jsonify({"message": "Questions uploaded successfully"})
    except Exception as e:
        logging.error(f"Error in upload_questions: {e}")
        return jsonify({"error": f"Failed to process questions file: {str(e)}"}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.route('/upload/expected_answers', methods=['POST'])
def upload_expected_answers():
    """Handles the upload of the expected answers PDF."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        global expected_answers_data
        expected_answers_data = {}

        expected_answers_text = extract_text_from_pdf(file_path)
        expected_answers_text = preprocess_text(expected_answers_text)
        expected_answers_data = parse_answers(expected_answers_text)
        return jsonify({"message": "Expected answers uploaded successfully"})
    except Exception as e:
        logging.error(f"Error in upload_expected_answers: {e}")
        return jsonify({"error": f"Failed to process expected answers file: {str(e)}"}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.route('/upload/student_answers_image', methods=['POST'])
def upload_student_answers_image():
    """Handles the upload of a student answers image."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        extracted_text = extract_text_from_image(file_path)
        extracted_text = preprocess_text(extracted_text)

        parsed_answers = parse_answers(extracted_text)

        global student_answers_data
        student_answers_data.update(parsed_answers)

        combined_dict = {
            "questions": questions_data,
            "expected_answers": expected_answers_data,
            "student_answers": student_answers_data
        }

        save_to_file('combined_dictionary.txt', json.dumps(combined_dict, indent=4))

        return jsonify({
            "message": "Student answers image uploaded and processed successfully",
            "extracted_text": extracted_text,
            "student_answers": parsed_answers
        })
    except Exception as e:
        logging.error(f"Error in upload_student_answers_image: {e}")
        return jsonify({"error": f"Failed to process student answers image: {str(e)}"}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

def grade_questions(questions_subset):
    """Grades a subset of questions using the OpenAI-compatible API."""
    results = []
    for question_number, question_info in questions_subset.items():
        question = question_info["question"]
        max_marks = question_info["marks"]
        expected_answer = expected_answers_data.get(question_number, "Expected answer not found.")
        student_answer = student_answers_data.get(question_number, "Student answer not found.")

        prompt = f"""
        You are an expert exam paper grading system. Your task is to grade the following question based on the student's answer.

        *Question*: {question}
        *Expected Answer*: {expected_answer}
        *Student Answer*: {student_answer}

        *Grading Criteria*:
        1. *Content Accuracy (50% weightage)*:
           - Does the student's answer align with the expected answer in terms of meaning and key points?
        2. *Depth of Explanation (30% weightage)*:
           - Is the answer detailed and comprehensive?
        3. *Grammar and Clarity (10% weightage)*:
           - Is the answer free of grammatical errors?
        4. *Relevance (10% weightage)*:
           - Does the answer stay on topic and avoid irrelevant information?
        5. *Volume of Answer*:
           - For a {max_marks}-mark question, the answer should be at least {max_marks * 2} sentences long.

        *Output Format*:
        - Marks Awarded: [marks out of {max_marks}]
        - Feedback: [brief feedback in 2-3 lines]

        Provide the output in the specified format.
        """

        response = grading_client.chat.completions.create(
            model="klusterai/Meta-Llama-3.1-8B-Instruct-Turbo",
            max_tokens=500,
            temperature=0.7,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": prompt}
            ]
        )

        logging.debug(f"API Response for question {question_number}: {response}")

        if response.choices and response.choices[0].message.content:
            response_text = response.choices[0].message.content
            logging.debug(f"Parsed Response Text: {response_text}")

            marks_line = response_text.split("\n")[0]
            marks_match = re.search(r'\d+\.?\d*', marks_line)
            if marks_match:
                marks_awarded = float(marks_match.group())
                feedback = "\n".join(response_text.split("\n")[1:]).strip()
                results.append({
                    "question_number": question_number,
                    "marks_awarded": marks_awarded,
                    "feedback": feedback,
                })
            else:
                results.append({
                    "question_number": question_number,
                    "error": "Failed to extract marks from the response."
                })
        else:
            results.append({
                "question_number": question_number,
                "error": "Failed to grade this question."
            })
    return results

@app.route('/grade', methods=['GET'])
def grade_student_answers():
    """Grades student answers using the OpenAI-compatible API and returns the total marks."""
    try:
        if not questions_data or not expected_answers_data or not student_answers_data:
            return jsonify({"error": "Please upload all required files (questions, expected answers, and student answers)."}), 400

        results = grade_questions(questions_data)

        total_marks_obtained = 0
        total_max_marks = sum(question["marks"] for question in questions_data.values())

        for result in results:
            if "marks_awarded" in result:
                total_marks_obtained += float(result["marks_awarded"])

        final_response = {
            "total_marks_obtained": total_marks_obtained,
            "total_max_marks": total_max_marks,
            "results": results
        }

        logging.debug(f"Final Response: {final_response}")

        return jsonify(final_response)

    except Exception as e:
        logging.error(f"Error in grade_student_answers: {e}")
        return jsonify({"error": f"Failed to grade student answers: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)