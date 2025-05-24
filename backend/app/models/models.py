import uuid
import json
from datetime import datetime as dt
from sqlalchemy import Column, String, Boolean, ForeignKey, ARRAY, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
import os

Base = declarative_base()

# Determine if we're using SQLite or PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./linkup.db")
USE_SQLITE = DATABASE_URL.startswith("sqlite")

# Use String for SQLite, UUID for PostgreSQL
if USE_SQLITE:
    # For SQLite, use String and store UUID as string
    def generate_uuid():
        return str(uuid.uuid4())
    
    ID_TYPE = String(36)
    ARRAY_TYPE = Text  # SQLite doesn't support ARRAY, we'll store as JSON string
else:
    # For PostgreSQL, use proper UUID type
    ID_TYPE = UUID(as_uuid=True)
    ARRAY_TYPE = ARRAY(String)
    generate_uuid = uuid.uuid4

class User(Base):
    __tablename__ = "users"
    
    id = Column(ID_TYPE, primary_key=True, default=generate_uuid)
    telegram_id = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    _interests = Column("interests", ARRAY_TYPE, nullable=False, default="[]" if USE_SQLITE else list)
    _photos = Column("photos", ARRAY_TYPE, nullable=False, default="[]" if USE_SQLITE else list)
    created_at = Column(DateTime, default=dt.utcnow)
    updated_at = Column(DateTime, default=dt.utcnow, onupdate=dt.utcnow)
    
    events = relationship("Event", back_populates="creator")
    responses = relationship("EventResponse", back_populates="user")
    badges = relationship("Badge", back_populates="user")
    
    @hybrid_property
    def interests(self):
        if USE_SQLITE:
            try:
                return json.loads(self._interests) if self._interests else []
            except (json.JSONDecodeError, TypeError):
                return []
        return self._interests or []
    
    @interests.setter
    def interests(self, value):
        if USE_SQLITE:
            self._interests = json.dumps(value or [])
        else:
            self._interests = value or []
    
    @hybrid_property
    def photos(self):
        if USE_SQLITE:
            try:
                return json.loads(self._photos) if self._photos else []
            except (json.JSONDecodeError, TypeError):
                return []
        return self._photos or []
    
    @photos.setter
    def photos(self, value):
        if USE_SQLITE:
            self._photos = json.dumps(value or [])
        else:
            self._photos = value or []

class Event(Base):
    __tablename__ = "events"
    
    id = Column(ID_TYPE, primary_key=True, default=generate_uuid)
    creator_id = Column(ID_TYPE, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    location = Column(String, nullable=False)
    datetime = Column(DateTime, nullable=False)
    is_open = Column(Boolean, default=True)
    type = Column(String, nullable=False)
    created_at = Column(DateTime, default=dt.utcnow)
    updated_at = Column(DateTime, default=dt.utcnow, onupdate=dt.utcnow)
    
    creator = relationship("User", back_populates="events")
    responses = relationship("EventResponse", back_populates="event")

class EventResponse(Base):
    __tablename__ = "event_responses"
    
    id = Column(ID_TYPE, primary_key=True, default=generate_uuid)
    event_id = Column(ID_TYPE, ForeignKey("events.id"), nullable=False)
    user_id = Column(ID_TYPE, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    responded_at = Column(DateTime, default=dt.utcnow)
    
    event = relationship("Event", back_populates="responses")
    user = relationship("User", back_populates="responses")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(ID_TYPE, primary_key=True, default=generate_uuid)
    user_id = Column(ID_TYPE, ForeignKey("users.id"), nullable=False)
    badge_type = Column(String, nullable=False)
    awarded_at = Column(DateTime, default=dt.utcnow)
    
    user = relationship("User", back_populates="badges") 