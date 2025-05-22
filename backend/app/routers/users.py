from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import hashlib
import hmac
import time
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, UserUpdate, TelegramAuth
import os
from dotenv import load_dotenv

load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

def verify_telegram_auth(auth_data: TelegramAuth) -> bool:
    # Check if auth data is recent (1 day)
    if time.time() - auth_data.auth_date > 86400:
        return False
        
    # Create data string
    data_check_string = '\n'.join([
        f"{key}={value}" for key, value in auth_data.dict().items() 
        if key != 'hash' and value is not None
    ])
    
    # Create hash
    secret_key = hashlib.sha256(BOT_TOKEN.encode()).digest()
    computed_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return computed_hash == auth_data.hash

@router.post("/", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.telegram_id == user_data.telegram_id).first()
    if existing_user:
        return existing_user
        
    # Create new user
    db_user = User(
        telegram_id=user_data.telegram_id,
        name=user_data.name,
        avatar_url=user_data.avatar_url,
        bio=user_data.bio,
        interests=user_data.interests,
        photos=user_data.photos
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    return user

@router.get("/telegram/{telegram_id}", response_model=UserResponse)
def get_user_by_telegram_id(telegram_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with Telegram ID {telegram_id} not found"
        )
    return user

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_data: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    # Update fields
    for key, value in user_data.dict(exclude_unset=True).items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/auth", response_model=UserResponse)
def authenticate_user(auth_data: TelegramAuth, db: Session = Depends(get_db)):
    # Verify Telegram authentication
    if not verify_telegram_auth(auth_data):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication data"
        )
    
    # Check if user exists
    user = db.query(User).filter(User.telegram_id == auth_data.id).first()
    
    # If user doesn't exist, create one
    if not user:
        user = User(
            telegram_id=auth_data.id,
            name=auth_data.first_name,
            avatar_url=auth_data.photo_url
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user 