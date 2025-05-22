from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import EventResponse, Event, User
from app.schemas.schemas import EventResponseCreate, EventResponseOut, EventResponseUpdate

router = APIRouter(
    prefix="/responses",
    tags=["responses"]
)

@router.post("/", response_model=EventResponseOut)
def create_response(response_data: EventResponseCreate, user_id: str, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found"
        )
    
    # Check if event exists
    event = db.query(Event).filter(Event.id == response_data.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {response_data.event_id} not found"
        )
    
    # Check if event is open
    if not event.is_open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event is not open for responses"
        )
    
    # Check if user is not the creator
    if str(event.creator_id) == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot respond to your own event"
        )
    
    # Check if user has already responded
    existing_response = db.query(EventResponse).filter(
        EventResponse.event_id == response_data.event_id,
        EventResponse.user_id == user_id
    ).first()
    
    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already responded to this event"
        )
    
    # Create response
    db_response = EventResponse(
        event_id=response_data.event_id,
        user_id=user_id,
        status="pending"
    )
    
    db.add(db_response)
    db.commit()
    db.refresh(db_response)
    
    return db_response

@router.get("/event/{event_id}", response_model=List[EventResponseOut])
def get_event_responses(event_id: str, user_id: str, db: Session = Depends(get_db)):
    # Check if event exists
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
            detail="Only the creator can see event responses"
        )
    
    # Get responses
    responses = db.query(EventResponse).filter(EventResponse.event_id == event_id).all()
    return responses

@router.get("/user/{user_id}", response_model=List[EventResponseOut])
def get_user_responses(user_id: str, db: Session = Depends(get_db)):
    responses = db.query(EventResponse).filter(EventResponse.user_id == user_id).all()
    return responses

@router.put("/{response_id}", response_model=EventResponseOut)
def update_response(response_id: str, response_data: EventResponseUpdate, user_id: str, db: Session = Depends(get_db)):
    # Check if response exists
    response = db.query(EventResponse).filter(EventResponse.id == response_id).first()
    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Response with id {response_id} not found"
        )
    
    # Check if event exists
    event = db.query(Event).filter(Event.id == response.event_id).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {response.event_id} not found"
        )
    
    # Check if user is the creator of the event
    if str(event.creator_id) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the event creator can update response status"
        )
    
    # Update response status
    response.status = response_data.status
    
    db.commit()
    db.refresh(response)
    
    return response 