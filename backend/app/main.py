from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import threading
from sqlalchemy.orm import Session
from ..app.database import get_db, engine
from ..models.models import Base
from ..routers import users, events, responses
from ..services import telegram_bot

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LinkUp API",
    description="API for the LinkUp Telegram Web App",
    version="0.1.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:4173",  # Vite preview
    "*"  # Allow all origins in development
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

@app.on_event("startup")
def startup_event():
    # Start the Telegram bot in a separate thread
    bot_thread = threading.Thread(target=telegram_bot.run_bot)
    bot_thread.daemon = True
    bot_thread.start()

@app.get("/", tags=["root"])
def read_root():
    return {"message": "Welcome to the LinkUp API"}

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"} 