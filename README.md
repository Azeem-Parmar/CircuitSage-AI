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

An interactive circuit analysis workspace offering three analysis modes.

**Basic Analysis**
- Create basic DC resistor networks.
- Supports series and parallel connections.
- Add and remove resistors dynamically.
- Calculate equivalent resistance, total current, total power, individual resistor voltage drops, currents, and power.
- Dynamic circuit schematic visualization.

**Nodal Analysis**
- Analyze DC circuits using Modified Nodal Analysis (MNA).
- Supports resistors and ideal independent DC voltage sources.
- Calculate node voltages.
- Calculate resistor branch currents and power.
- Calculate voltage source currents and power.
- Verify Kirchhoff's Current Law (KCL).
- Check electrical power balance.

**Mesh Analysis**
- Analyze planar DC circuits using Kirchhoff's Voltage Law (KVL).
- Supports multiple meshes and shared resistor branches.
- Supports ideal independent DC voltage sources.
- Calculate mesh currents and resistor branch currents.
- Calculate voltage drops and resistor power.
- Verify total resistor power against source power supplied.

**Electrical Verification**
- KCL residual verification in nodal analysis.
- Power balance verification in nodal and mesh analysis.
- Numerical Gaussian elimination with partial pivoting for solving linear systems.

**Current Limitations**
- The advanced analysis engines currently support DC resistive networks and ideal independent voltage sources.
- Current sources, capacitors, inductors, and transient or AC analysis are not currently supported.
- Mesh analysis requires the user to define the mesh branches and their directions explicitly.
- Circuit Builder is not yet a general-purpose schematic-based circuit simulator.

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

### Testing
- Vitest
- Automated JavaScript unit tests

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
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CircuitBuilder.jsx
│   │   │   ├── NodalAnalysisPanel.jsx
│   │   │   ├── MeshAnalysisPanel.jsx
│   │   │   ├── ComponentLibrary.jsx
│   │   │   └── WaveformStudio.jsx
│   │   │
│   │   ├── circuit/
│   │   │   ├── circuitEngine.js
│   │   │   └── __tests__/
│   │   │
│   │   ├── advanced-circuit/
│   │   │   ├── advancedCircuitEngine.js
│   │   │   ├── meshAnalysisEngine.js
│   │   │   └── __tests__/
│   │   │
│   │   ├── data/
│   │   │   └── components.js
│   │   │
│   │   ├── waveform/
│   │   │   └── waveformEngine.js
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
- Series and Parallel Resistance
- Voltage Division
- Current Distribution
- Kirchhoff's Current Law (KCL)
- Kirchhoff's Voltage Law (KVL)
- Modified Nodal Analysis
- Mesh Current Analysis
- Gaussian Elimination
- Basic Waveform Mathematics
- Electrical Power Balance

## 🧪 Testing and Validation

The frontend has undergone automated and manual testing.

**Automated testing**
- 27 automated tests across 3 test files.
- Basic circuit engine tests.
- Advanced circuit analysis engine tests.
- Mesh analysis engine tests.

**Quality checks**
- ESLint validation.
- Vitest test execution.
- Vite production build verification.

**Manual testing**
- Basic series and parallel circuit calculations.
- Nodal analysis and node voltage verification.
- Mesh current and shared resistor calculations.
- KCL and electrical power balance checks.
- Waveform generation and parameter testing.
- Desktop and mobile responsive interface testing.

Run the frontend checks:

```bash
cd frontend

npm run lint

npm run test:run

npm run build
```

## 🗺️ Development Roadmap

- [x] Project setup and dashboard
- [x] Ohm's Law Circuit Analyzer
- [x] Electronic Component Library
- [x] Interactive Waveform Studio
- [x] Basic Series and Parallel Circuit Builder
- [x] Automated unit testing
- [x] Modified Nodal Analysis
- [x] Mesh Current Analysis
- [x] KCL and KVL-based circuit calculations
- [x] Electrical power balance verification
- [ ] Advanced circuit simulation
- [ ] AC circuit analysis
- [ ] Transient analysis
- [ ] Online deployment

## 👨‍💻 Author

**Azeem Parmar**

GitHub: https://github.com/Azeem-Parmar

Project Repository: https://github.com/Azeem-Parmar/CircuitSage-AI

---

*CircuitSage AI — Making Electrical Engineering More Interactive.* ⚡