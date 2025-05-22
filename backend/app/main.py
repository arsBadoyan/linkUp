from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from app.routers import users, events, responses
from app.database import engine
from app.models.models import Base
from app.services.telegram_bot import run_bot
import threading
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="LinkUp API",
    description="API for LinkUp - Telegram Web App for organizing events and meetings",
    version="1.0.0"
)

# Configure CORS
origins = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),  # Default frontend URL
    "https://linkup-frontend.up.railway.app",  # Production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router)
app.include_router(events.router)
app.include_router(responses.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to LinkUp API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

def start_bot():
    run_bot()

if __name__ == "__main__":
    # Start Telegram bot in a separate thread
    bot_thread = threading.Thread(target=start_bot)
    bot_thread.daemon = True
    bot_thread.start()
    
    # Start FastAPI server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    ) 