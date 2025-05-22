from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    interests: List[str] = []
    photos: List[str] = []

class UserCreate(UserBase):
    telegram_id: int

class UserUpdate(UserBase):
    name: Optional[str] = None
    
class UserResponse(UserBase):
    id: UUID
    telegram_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class EventBase(BaseModel):
    title: str
    description: str
    location: str
    datetime: datetime
    type: str = "custom"
    is_open: bool = True

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    datetime: Optional[datetime] = None
    is_open: Optional[bool] = None
    type: Optional[str] = None

class EventResponse(EventBase):
    id: UUID
    creator_id: UUID
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserResponse] = None
    
    class Config:
        orm_mode = True

class EventResponseBase(BaseModel):
    event_id: UUID
    status: str = "pending"

class EventResponseCreate(EventResponseBase):
    pass

class EventResponseUpdate(BaseModel):
    status: str

class EventResponseOut(EventResponseBase):
    id: UUID
    user_id: UUID
    responded_at: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        orm_mode = True

class BadgeBase(BaseModel):
    user_id: UUID
    badge_type: str

class BadgeCreate(BadgeBase):
    pass

class BadgeResponse(BadgeBase):
    id: UUID
    awarded_at: datetime
    
    class Config:
        orm_mode = True

class TelegramAuth(BaseModel):
    id: int
    first_name: str
    username: Optional[str] = None
    photo_url: Optional[str] = None
    auth_date: int
    hash: str 