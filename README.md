# CircuitSage AI ⚡

### AI-Powered Engineering Intelligence Workspace

CircuitSage AI is a web-based engineering workspace designed to simplify electrical circuit calculations, explore electronic components, and support engineering learning.

## Features

- Circuit Analyzer using Ohm's Law
- Electronic Component Library
- Waveform Studio
- Engineering Documentation
- Modern responsive dashboard

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- Lucide React
- Axios

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

## Project Structure

- backend/
  - main.py
  - requirements.txt
- frontend/
  - src/
  - package.json
  - vite.config.js
- README.md
- .gitignore

## Installation

### Clone Repository

git clone https://github.com/Azeem-Parmar/CircuitSage-AI.git

cd CircuitSage-AI

### Backend Setup

python3 -m venv backend/venv

source backend/venv/bin/activate

pip install -r backend/requirements.txt

python -m uvicorn backend.main:app --reload

### Frontend Setup

Open another terminal:

cd frontend

npm install

npm run dev

## API Endpoints

- GET / : Welcome endpoint
- GET /health : Health check
- POST /api/analyze : Circuit analysis

## Circuit Calculations

- Ohm's Law: V = I × R
- Current: I = V / R
- Power: P = V × I

## Author

Azeem Parmar

GitHub: https://github.com/Azeem-Parmar

## Project Status

Day 1 and Day 2 development completed.
