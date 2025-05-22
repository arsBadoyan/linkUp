from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import hashlib
import hmac
import time
import json
import logging
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse, UserUpdate, TelegramAuth
import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
# Устанавливаем DEBUG_MODE в True по умолчанию для облегчения разработки
DEBUG_MODE = os.getenv("DEBUG_MODE", "True").lower() in ("true", "1", "t")

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

# Модель для приема raw initData
class InitDataAuth(BaseModel):
    initData: str

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

# Парсер данных из Telegram initData
def parse_init_data(init_data_str: str) -> Dict[str, Any]:
    try:
        # Разбираем строку параметров запроса
        params = {}
        for param in init_data_str.split('&'):
            if '=' in param:
                key, value = param.split('=', 1)
                params[key] = value

        # Создаем соответствующий объект auth_data
        user_data = json.loads(params.get('user', '{}'))
        
        auth_data = {
            'id': int(user_data.get('id', 0)),
            'first_name': user_data.get('first_name', ''),
            'username': user_data.get('username'),
            'photo_url': user_data.get('photo_url'),
            'auth_date': int(params.get('auth_date', 0)),
            'hash': params.get('hash', '')
        }
        
        return auth_data
    except Exception as e:
        logger.error(f"Error parsing init data: {str(e)}")
        return {}

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
async def authenticate_user(request: Request, db: Session = Depends(get_db)):
    try:
        # Получаем тело запроса
        body = await request.json()
        init_data = body.get('initData', '')
        
        logger.info(f"Received initData: {init_data[:30]}...")
        
        # Если это тестовый режим или initData пустой, создаем тестового пользователя
        if DEBUG_MODE or not init_data:
            logger.info("Using debug mode or empty initData, returning test user")
            # Проверяем, существует ли тестовый пользователь
            test_user = db.query(User).filter(User.telegram_id == 12345).first()
            
            if not test_user:
                # Создаем тестового пользователя
                test_user = User(
                    telegram_id=12345,
                    name="Test User",
                    avatar_url="https://via.placeholder.com/100",
                    bio="This is a test user for development"
                )
                db.add(test_user)
                db.commit()
                db.refresh(test_user)
            
            return test_user
        
        # Парсим initData
        auth_data_dict = parse_init_data(init_data)
        
        if not auth_data_dict:
            logger.error("Failed to parse initData")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Invalid initData format"
            )
        
        # Создаем объект TelegramAuth из распарсенных данных
        auth_data = TelegramAuth(**auth_data_dict)
        
        # Проверяем аутентификацию
        if not verify_telegram_auth(auth_data):
            logger.error("Failed to verify Telegram authentication")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication data"
            )
        
        # Ищем пользователя в базе
        user = db.query(User).filter(User.telegram_id == auth_data.id).first()
        
        # Если пользователя нет, создаем нового
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
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        ) 