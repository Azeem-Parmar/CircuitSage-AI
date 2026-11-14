
# CircuitSage AI

**AI-Powered Engineering Intelligence Workspace**

CircuitSage AI is a web-based engineering workspace designed to simplify electrical circuit calculations, analyze complex circuits, visualize circuit behavior, and support electrical engineering learning through interactive tools and lessons.

The platform combines circuit analysis engines, interactive circuit schematics, engineering documentation, and a dedicated Learning Center in one workspace.

---

## Features

### 1. Circuit Analyzer
- Ohm's Law calculations.
- Voltage, current, resistance, and power calculations.
- Input validation and error handling.
- Real-time calculation results.
- Interactive circuit analysis interface.

### 2. Advanced Circuit Analysis
- Modified Nodal Analysis (MNA).
- Mesh Current Analysis.
- Kirchhoff's Current Law (KCL).
- Kirchhoff's Voltage Law (KVL).
- Series and parallel circuit analysis.
- Mixed series-parallel circuit analysis.
- Nested circuit topology support.
- Equivalent resistance calculation.
- Node voltage and branch current calculation.
- Power calculation and power balance verification.
- Circuit connectivity validation.

### 3. Circuit Visualization
- Interactive circuit schematics.
- Series and parallel circuit layouts.
- Dynamic mixed-circuit visualization.
- Nested series-parallel circuit structures.
- Resistor resistance, current, voltage, and power labels.
- Current direction indicators.
- Calculated electrical values displayed on schematics.

### 4. Waveform Studio
- Interactive waveform exploration.
- Waveform generation and parameter adjustment.
- Visual representation of electrical signals.

### 5. Engineering Learning Center
- Interactive electrical engineering lessons.
- Electrical fundamentals: voltage, current, resistance, and power.
- Ohm's Law with formulas and worked numerical examples.
- Series and parallel circuit concepts.
- Kirchhoff's Current Law (KCL) and Voltage Law (KVL).
- Formula cards with explanations and units.
- Multiple-choice knowledge checks with instant feedback.
- Responsive lesson catalogue and lesson pages.

### 6. Component Library
- Engineering component reference section.
- Electrical component information and learning resources.

### 7. Backend Health Monitoring
- FastAPI backend integration.
- Backend health status monitoring.
- Automatic health checks.
- API error handling and input validation.

---

## Tech Stack

### Frontend
- React 19
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- Axios

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

### Testing and Development
- Vitest
- ESLint
- Vite Build

---

## Project Structure

```text
CircuitSage-AI/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── public/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── CircuitBuilder.jsx
│   │   │   ├── CircuitSchematic.jsx
│   │   │   ├── LearningCenter.jsx
│   │   │   ├── MixedAnalysisPanel.jsx
│   │   │   ├── MixedCircuitSchematic.jsx
│   │   │   ├── NodalAnalysisPanel.jsx
│   │   │   └── MeshAnalysisPanel.jsx
│   │   │
│   │   ├── advanced-circuit/
│   │   │   ├── advancedCircuitEngine.js
│   │   │   ├── linearSolver.js
│   │   │   └── meshAnalysisEngine.js
│   │   │
│   │   ├── circuit/
│   │   │   ├── circuitEngine.js
│   │   │   └── mixedCircuitEngine.js
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

---

## Installation and Setup

### Prerequisites

Make sure the following tools are installed:

- Node.js
- npm
- Python 3
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Azeem-Parmar/CircuitSage-AI.git
cd CircuitSage-AI
```

### 2. Frontend Setup

Open a terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

### 3. Backend Setup

Open another terminal from the project root:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate the virtual environment:

**Linux / Ubuntu:**

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Backend welcome message |
| GET | `/health` | Backend health status |
| POST | `/api/analyze` | Basic circuit analysis |

### Example API Request

**Endpoint:**

```text
POST /api/analyze
```

**Request Body:**

```json
{
  "voltage": 12,
  "resistance": 100
}
```

**Expected Calculation:**

- Voltage = 12 V
- Resistance = 100 Ω
- Current = 0.12 A
- Power = 1.44 W

---

## Circuit Analysis

### 1. Ohm's Law

The basic circuit analyzer uses:

\[
V = I \times R
\]

Where:

- V = Voltage (Volts)
- I = Current (Amperes)
- R = Resistance (Ohms)

Power calculation:

\[
P = V \times I
\]

### 2. Nodal Analysis

Nodal analysis uses Modified Nodal Analysis (MNA) to calculate node voltages and branch currents in electrical circuits.

### 3. Mesh Analysis

Mesh analysis uses Kirchhoff's Voltage Law to calculate mesh currents in planar circuits.

### 4. Mixed Circuit Analysis

The mixed circuit engine supports recursively nested series-parallel networks.

It calculates:

- Equivalent resistance.
- Total supply current.
- Individual resistor current.
- Voltage drop across each resistor.
- Individual resistor power.
- Total circuit power.

---

## Testing and Validation

The frontend includes automated tests and development checks.

Run the test suite:

```bash
npm run test:run
```

Run ESLint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

### Manual Testing

The project has been tested for:

- Basic Ohm's Law calculations.
- Nodal analysis.
- Mesh analysis.
- Series and parallel circuits.
- Nested mixed-circuit topology.
- Circuit schematic visualization.
- Resistor value editing and topology changes.
- Backend health monitoring.
- API input validation and error handling.
- Engineering Learning Center navigation.
- Electrical fundamentals and Ohm's Law lessons.
- Series and parallel circuit lessons.
- KCL and KVL lesson content.
- Knowledge-check answer validation.
- Desktop and mobile responsiveness.

---

## Development Roadmap

### Completed

- [x] React and Vite frontend setup.
- [x] FastAPI backend setup.
- [x] Basic circuit analyzer.
- [x] Ohm's Law calculations.
- [x] Modified Nodal Analysis.
- [x] Mesh Current Analysis.
- [x] Gaussian elimination solver.
- [x] KCL and KVL validation.
- [x] Power balance verification.
- [x] Circuit example presets.
- [x] Input validation and error handling.
- [x] Mixed series-parallel circuit analysis.
- [x] Dynamic nested circuit topology editor.
- [x] Interactive circuit schematics.
- [x] Mixed circuit schematic visualization.
- [x] Backend health monitoring.
- [x] Frontend and backend integration.
- [x] Engineering Learning Center.
- [x] Interactive electrical engineering lessons.
- [x] Formula explanations and worked examples.
- [x] Interactive knowledge checks.
- [x] Responsive Learning Center interface.

### Upcoming

- [ ] Advanced circuit simulation improvements.
- [ ] AC circuit analysis.
- [ ] Transient circuit analysis.
- [ ] Additional engineering components and reference resources.
- [ ] Further UI and performance improvements.
- [ ] Final integration and project-wide testing.
- [ ] Deployment.

---

## Project Status

CircuitSage AI is under active development.

The basic circuit analysis engine, advanced circuit solvers, mixed-circuit editor, schematic visualization, backend integration, and Engineering Learning Center have been implemented.

Further simulation capabilities, testing, refinement, and deployment are planned.

---

## Author

**Azeem Parmar**

B.Tech – Electronics and Communication Engineering

GitHub: [Azeem-Parmar](https://github.com/Azeem-Parmar)

Project Repository: [CircuitSage-AI](https://github.com/Azeem-Parmar/CircuitSage-AI)

---

**CircuitSage AI – Simplifying Circuit Analysis and Engineering Learning.**
