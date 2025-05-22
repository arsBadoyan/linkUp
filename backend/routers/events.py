from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..app.database import get_db
from ..models.models import Event, User, EventResponse as EventResponseModel
from ..schemas.schemas import EventCreate, EventResponse, EventUpdate

router = APIRouter(
    prefix="/events",
    tags=["events"]
)

@router.post("/", response_model=EventResponse)
def create_event(event_data: EventCreate, user_id: str, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    # Create event
    db_event = Event(
        creator_id=user_id,
        title=event_data.title,
        description=event_data.description,
        location=event_data.location,
        datetime=event_data.datetime,
        type=event_data.type,
        is_open=event_data.is_open
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    return db_event

@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0, 
    limit: int = 100, 
    event_type: Optional[str] = None, 
    location: Optional[str] = None,
    is_open: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Event)
    
    # Apply filters
    if event_type:
        query = query.filter(Event.type == event_type)
    if location:
        query = query.filter(Event.location.ilike(f"%{location}%"))
    if is_open is not None:
        query = query.filter(Event.is_open == is_open)
    
    events = query.order_by(Event.created_at.desc()).offset(skip).limit(limit).all()
    return events

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    return event

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, event_data: EventUpdate, user_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    # Check if user is the creator
    if str(event.creator_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update the event"
        )
    
    # Update fields
    for key, value in event_data.dict(exclude_unset=True).items():
        if value is not None:
            setattr(event, key, value)
    
    event.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(event)
    
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(event_id: str, user_id: str, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found"
        )
    
    # Check if user is the creator
    if str(event.creator_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can delete the event"
        )
    
    # Delete event responses first
    db.query(EventResponseModel).filter(EventResponseModel.event_id == event_id).delete()
    
    # Delete event
    db.delete(event)
    db.commit()
    
    return None

@router.get("/user/{user_id}", response_model=List[EventResponse])
def get_user_events(user_id: str, db: Session = Depends(get_db)):
    events = db.query(Event).filter(Event.creator_id == user_id).all()
    return events 