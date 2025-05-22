import uuid
from datetime import datetime as dt
from sqlalchemy import Column, String, Boolean, ForeignKey, ARRAY, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_id = Column(Integer, unique=True, nullable=False)
    name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    interests = Column(ARRAY(String), nullable=False, default=list)
    photos = Column(ARRAY(String), nullable=False, default=list)
    created_at = Column(DateTime, default=dt.utcnow)
    updated_at = Column(DateTime, default=dt.utcnow, onupdate=dt.utcnow)
    
    events = relationship("Event", back_populates="creator")
    responses = relationship("EventResponse", back_populates="user")
    badges = relationship("Badge", back_populates="user")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
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
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    responded_at = Column(DateTime, default=dt.utcnow)
    
    event = relationship("Event", back_populates="responses")
    user = relationship("User", back_populates="responses")

class Badge(Base):
    __tablename__ = "badges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    badge_type = Column(String, nullable=False)
    awarded_at = Column(DateTime, default=dt.utcnow)
    
    user = relationship("User", back_populates="badges") 