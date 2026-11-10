from fastapi import FastAPI

app = FastAPI(
    title="CircuitSage AI",
    description="AI-powered electronics circuit analysis platform",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to CircuitSage AI!",
        "status": "Running successfully"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}