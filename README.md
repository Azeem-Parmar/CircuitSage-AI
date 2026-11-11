# CircuitSage AI ⚡

### Engineering Intelligence & Circuit Analysis Workspace

CircuitSage AI is a web-based engineering workspace designed to help students and electronics enthusiasts explore electronic components, visualize electrical waveforms, and perform circuit calculations through an interactive interface.

The project combines a React frontend with a Python FastAPI backend to provide practical electrical engineering tools.

## 🚀 Features

### 1. Circuit Analyzer
- Ohm's Law calculator.
- Calculate voltage, current, resistance, and power.
- FastAPI-powered circuit calculation.
- Input validation and error handling.

### 2. Electronic Component Library
- Interactive electronic component catalogue.
- Search components by name and description.
- Filter components by category.
- View specifications, descriptions, and applications.
- Includes resistors, capacitors, inductors, diodes, transistors, MOSFETs, and sensors.

### 3. Waveform Studio
- Generate and visualize electrical waveforms.
- Supported waveforms:
  - Sine wave
  - Square wave
  - Triangle wave
  - Sawtooth wave
- Interactive controls for:
  - Amplitude
  - Frequency
  - Phase
  - DC offset
  - Number of cycles
- Live waveform visualization using SVG.

### 4. Circuit Builder
- Create basic DC resistor networks.
- Supports series and parallel connections.
- Add and remove resistors dynamically.
- Calculate:
  - Equivalent resistance
  - Total current
  - Total power
  - Individual resistor voltage drops
  - Individual resistor currents
  - Individual resistor power
- Dynamic circuit schematic visualization.

**Note:** The current Circuit Builder uses a JavaScript calculation engine for basic resistive networks. It is not yet a general-purpose circuit simulator.

## 🛠️ Technology Stack

### Frontend
- React 19
- Vite
- JavaScript
- HTML5
- CSS3
- Tailwind CSS
- Lucide React
- Axios

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### Development Tools
- Visual Studio Code
- Git
- GitHub
- Ubuntu

## 📁 Project Structure

```text
CircuitSage-AI/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComponentLibrary.jsx
│   │   │   ├── WaveformStudio.jsx
│   │   │   └── CircuitBuilder.jsx
│   │   │
│   │   ├── data/
│   │   │   └── components.js
│   │   │
│   │   ├── waveform/
│   │   │   └── waveformEngine.js
│   │   │
│   │   ├── circuit/
│   │   │   └── circuitEngine.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites
- Python 3
- Node.js and npm
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Azeem-Parmar/CircuitSage-AI.git

cd CircuitSage-AI
```

### 2. Backend Setup

Create and activate a virtual environment:

```bash
python3 -m venv backend/venv

source backend/venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn backend.main:app --reload
```

Backend runs at:

`http://127.0.0.1:8000`

API documentation:

`http://127.0.0.1:8000/docs`

### 3. Frontend Setup

Open a separate terminal:

```bash
cd CircuitSage-AI/frontend

npm install

npm run dev
```

Frontend runs at the local URL displayed by Vite, usually:

`http://localhost:5173`

## 🔌 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Welcome endpoint |
| GET | `/health` | Backend health check |
| POST | `/api/analyze` | Ohm's Law circuit analysis |

## 📐 Electrical Engineering Concepts

The project currently implements calculations based on:

- Ohm's Law
- Electrical Power
- Series Resistance
- Parallel Resistance
- Voltage Division in Series Networks
- Current Distribution in Parallel Networks
- Basic Waveform Mathematics

## 🧪 Testing and Validation

The project has undergone:
- Frontend production build verification.
- Manual testing of circuit calculations.
- Series and parallel resistor network checks.
- Waveform generation and parameter testing.
- Frontend and backend integration checks.

Automated unit testing and broader quality checks are planned as part of future development.

## 🗺️ Development Roadmap

- [x] Project setup and dashboard
- [x] Ohm's Law Circuit Analyzer
- [x] Electronic Component Library
- [x] Interactive Waveform Studio
- [x] Series and Parallel Circuit Builder
- [ ] Automated unit testing
- [ ] Kirchhoff's Current and Voltage Laws
- [ ] Advanced circuit simulation
- [ ] Online deployment

## 👨‍💻 Author

**Azeem Parmar**

GitHub: https://github.com/Azeem-Parmar

Project Repository: https://github.com/Azeem-Parmar/CircuitSage-AI

---

*CircuitSage AI — Making Electrical Engineering More Interactive.* ⚡
