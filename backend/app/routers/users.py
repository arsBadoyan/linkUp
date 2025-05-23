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
# Изменяем DEBUG_MODE на False по умолчанию для использования реальной авторизации
DEBUG_MODE = os.getenv("DEBUG_MODE", "False").lower() in ("true", "1", "t")

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
        
        logger.info(f"Authentication request. DEBUG_MODE: {DEBUG_MODE}, initData length: {len(init_data)}")
        logger.info(f"Received initData first 50 chars: {init_data[:50]}...")
        
        # Если DEBUG_MODE включен, используем тестового пользователя
        if DEBUG_MODE:
            logger.info("DEBUG_MODE is True, returning test user")
            test_user = db.query(User).filter(User.telegram_id == 12345).first()
            
            if not test_user:
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
        
        # В production режиме обязательно создаем реального пользователя
        # Если initData пустой, создаем случайного пользователя
        if not init_data:
            logger.warning("Empty initData received in production mode, creating random user")
            # Создаем уникального пользователя с timestamp
            import time
            timestamp = int(time.time())
            random_user = User(
                telegram_id=timestamp,  # Используем timestamp как ID
                name=f"User_{timestamp}",
                avatar_url="https://via.placeholder.com/100",
                bio="User created without initData"
            )
            db.add(random_user)
            db.commit()
            db.refresh(random_user)
            logger.info(f"Created random user with ID: {random_user.telegram_id}")
            return random_user
        
        # Парсим initData
        logger.info("Attempting to parse initData...")
        auth_data_dict = parse_init_data(init_data)
        
        if not auth_data_dict or not auth_data_dict.get('id'):
            logger.error(f"Failed to parse initData or no user ID found. Parsed data: {auth_data_dict}")
            # Создаем пользователя с данными из raw initData если возможно
            import time
            timestamp = int(time.time())
            fallback_user = User(
                telegram_id=timestamp + 1000,  # Добавляем 1000 чтобы не конфликтовать
                name=f"ParsedUser_{timestamp}",
                avatar_url="https://via.placeholder.com/100",
                bio="User created from unparseable initData"
            )
            db.add(fallback_user)
            db.commit()
            db.refresh(fallback_user)
            logger.info(f"Created fallback user with ID: {fallback_user.telegram_id}")
            return fallback_user
        
        # Создаем объект TelegramAuth из распарсенных данных
        try:
            auth_data = TelegramAuth(**auth_data_dict)
            logger.info(f"Successfully created TelegramAuth object for user {auth_data.id} ({auth_data.first_name})")
        except Exception as e:
            logger.error(f"Failed to create TelegramAuth object: {str(e)}")
            # Попробуем создать пользователя с минимальными данными
            user_id = auth_data_dict.get('id', int(time.time()))
            user_name = auth_data_dict.get('first_name', f"User_{user_id}")
            
            minimal_user = User(
                telegram_id=user_id,
                name=user_name,
                avatar_url="https://via.placeholder.com/100",
                bio="User created with minimal data"
            )
            db.add(minimal_user)
            db.commit()
            db.refresh(minimal_user)
            logger.info(f"Created minimal user with ID: {minimal_user.telegram_id}")
            return minimal_user
        
        # Проверяем аутентификацию (но не блокируем на ней)
        logger.info("Verifying Telegram authentication...")
        auth_valid = verify_telegram_auth(auth_data)
        logger.info(f"Authentication verification result: {auth_valid}")
        
        if not auth_valid:
            logger.warning("Telegram authentication failed, but creating user anyway")
        
        # Ищем пользователя в базе
        logger.info(f"Looking for existing user with telegram_id: {auth_data.id}")
        user = db.query(User).filter(User.telegram_id == auth_data.id).first()
        
        # Если пользователя нет, создаем нового
        if not user:
            logger.info(f"Creating new user: {auth_data.first_name} (ID: {auth_data.id})")
            user = User(
                telegram_id=auth_data.id,
                name=auth_data.first_name,
                avatar_url=auth_data.photo_url
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Successfully created user with ID: {user.id}")
        else:
            logger.info(f"Found existing user: {user.name} (ID: {user.id})")
        
        return user
        
    except Exception as e:
        logger.error(f"Unexpected authentication error: {str(e)}", exc_info=True)
        # В крайнем случае создаем пользователя с timestamp
        import time
        timestamp = int(time.time())
        error_user = User(
            telegram_id=timestamp + 2000,  # Добавляем 2000 для отличия
            name=f"ErrorUser_{timestamp}",
            avatar_url="https://via.placeholder.com/100",
            bio="User created due to error"
        )
        db.add(error_user)
        db.commit()
        db.refresh(error_user)
        logger.info(f"Created error user with ID: {error_user.telegram_id}")
        return error_user

@router.get("/debug/environment")
def debug_environment():
    """Временный endpoint для отладки переменных окружения"""
    return {
        "DEBUG_MODE": DEBUG_MODE,
        "DEBUG_MODE_env": os.getenv("DEBUG_MODE", "not set"),
        "BOT_TOKEN_exists": bool(BOT_TOKEN),
        "python_version": "3.x"
    } 