
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="CircuitSage AI",
    description="AI-powered electronics circuit analysis platform",
    version="1.0.0"
)

# Allow React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request model
class CircuitInput(BaseModel):
    voltage: float = Field(ge=0)
    resistance: float = Field(gt=0)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to CircuitSage AI!",
        "status": "Running successfully"
    }


# Health endpoint
@app.get("/health")
def health():
    return {"status": "healthy"}


# Circuit analysis endpoint
@app.post("/api/analyze")
def analyze_circuit(data: CircuitInput):

    voltage = data.voltage
    resistance = data.resistance

    current = voltage / resistance
    power = voltage * current

    return {
        "voltage": voltage,
        "resistance": resistance,
        "current": current,
        "power": power,
        "status": "success"
    }

