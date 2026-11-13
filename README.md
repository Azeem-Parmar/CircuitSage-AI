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

An interactive circuit analysis workspace offering four analysis modes.

**Basic Analysis**
- Create basic DC resistor networks.
- Supports series and parallel connections.
- Add and remove resistors dynamically.
- Calculate equivalent resistance, total current, total power, individual resistor voltage drops, currents, and power.
- Live series and parallel circuit schematic visualization.
- Display calculated total current and individual resistor current.
- Display individual resistor voltage drops and resistance values.
- Visual branch-current direction indicators.
- Automatically clear stale electrical values when circuit inputs change.
- Includes predefined series and parallel circuit examples.

**Nodal Analysis**
- Analyze DC circuits using Modified Nodal Analysis (MNA).
- Supports resistors and ideal independent DC voltage sources.
- Calculate node voltages.
- Calculate resistor branch currents and power.
- Calculate voltage source currents and power.
- Verify Kirchhoff's Current Law (KCL).
- Check electrical power balance.
- Includes single-node, two-node, and voltage-divider examples.
- Detects circuit nodes disconnected from the reference ground.

**Mesh Analysis**
- Analyze planar DC circuits using Kirchhoff's Voltage Law (KVL).
- Supports multiple meshes and shared resistor branches.
- Supports ideal independent DC voltage sources.
- Calculate mesh currents and resistor branch currents.
- Calculate voltage drops and resistor power.
- Verify total resistor power against source power supplied.
- Includes single-mesh, two-mesh, and three-mesh examples.

**Mixed Analysis**
- Analyze nested series-parallel DC resistor networks.
- Dynamically create nested series and parallel groups.
- Add and remove resistors and nested groups through the topology editor.
- Change group connection types between series and parallel.
- Display a live topology summary and resistor/group counts.
- Calculate equivalent resistance, total current, and total power.
- Calculate individual resistor voltage drops, currents, and power.
- Validate resistor values, supply voltage, network structure, and duplicate resistor names.
- Reset the network to its default configuration.

**Numerical Solver and Electrical Verification**
- Shared linear-system solver using Gaussian elimination with scaled partial pivoting.
- Matrix and input validation.
- Detection of singular or numerically unstable systems.
- Ground-connectivity validation in nodal analysis.
- KCL residual verification in nodal analysis.
- Power balance verification in nodal and mesh analysis.
- Numerical range validation in circuit calculations.

**Current Limitations**
- The advanced analysis engines currently support DC resistive networks and ideal independent voltage sources.
- Current sources, dependent sources, capacitors, inductors, and semiconductor device models are not currently supported by the advanced circuit analysis engines.
- AC analysis and transient analysis are not currently supported.
- Mesh analysis requires the user to define mesh branches and their directions explicitly.
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
- ESLint
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
│   │   │   ├── CircuitSchematic.jsx
│   │   │   ├── NodalAnalysisPanel.jsx
│   │   │   ├── MeshAnalysisPanel.jsx
│   │   │   ├── MixedAnalysisPanel.jsx
│   │   │   ├── ComponentLibrary.jsx
│   │   │   └── WaveformStudio.jsx
│   │   │
│   │   ├── circuit/
│   │   │   ├── circuitEngine.js
│   │   │   ├── mixedCircuitEngine.js
│   │   │   └── __tests__/
│   │   │       ├── circuitEngine.test.js
│   │   │       └── mixedCircuitEngine.test.js
│   │   │
│   │   ├── advanced-circuit/
│   │   │   ├── advancedCircuitEngine.js
│   │   │   ├── meshAnalysisEngine.js
│   │   │   ├── linearSolver.js
│   │   │   └── __tests__/
│   │   │       ├── advancedCircuitEngine.test.js
│   │   │       ├── circuitValidation.test.js
│   │   │       ├── linearSolver.test.js
│   │   │       └── meshAnalysisEngine.test.js
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
- Mixed Series-Parallel Networks
- Voltage Division
- Current Distribution
- Kirchhoff's Current Law (KCL)
- Kirchhoff's Voltage Law (KVL)
- Modified Nodal Analysis
- Mesh Current Analysis
- Gaussian Elimination with Scaled Partial Pivoting
- Basic Waveform Mathematics
- Electrical Power Balance

## 🧪 Testing and Validation

The frontend has undergone automated and manual testing.

**Automated testing**
- 58 automated tests across 6 test files.
- Basic circuit engine tests.
- Mixed circuit engine tests.
- Advanced circuit analysis engine tests.
- Mesh analysis engine tests.
- Shared numerical solver tests.
- Circuit input and ground-connectivity validation tests.

**Quality checks**
- ESLint validation.
- Vitest test execution.
- Vite production build verification.

**Manual testing**
- Basic series and parallel circuit calculations.
- Predefined basic circuit examples.
- Nodal analysis and node voltage verification.
- Mesh current and shared resistor calculations.
- Predefined single, two, and three-mesh examples.
- Mixed series-parallel circuit calculations.
- Invalid voltage and resistor input validation.
- Reset behavior and result clearing.
- KCL and electrical power balance checks.
- Ground-connectivity validation.
- Waveform generation and parameter testing.
- Desktop and mobile responsive interface testing.

Run the frontend checks:

```bash
cd frontend

npm run lint

npm test -- --run

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
- [x] Mixed Series-Parallel Circuit Analysis
- [x] KCL and KVL-based circuit calculations
- [x] Electrical power balance verification
- [x] Shared numerical solver and circuit validation
- [x] Predefined circuit examples
- [x] Basic and mixed circuit input validation
- [x] Responsive circuit analysis interface
- [ ] General-purpose advanced circuit simulation
- [ ] AC circuit analysis
- [ ] Transient analysis
- [ ] Online deployment

## 👨‍💻 Author

**Azeem Parmar**

GitHub: https://github.com/Azeem-Parmar

Project Repository: https://github.com/Azeem-Parmar/CircuitSage-AI

---

*CircuitSage AI — Making Electrical Engineering More Interactive.* ⚡