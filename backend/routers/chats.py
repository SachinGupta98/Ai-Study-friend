"""
routers/chats.py — AI Companion (General Chat) history endpoints
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User, GeneralChat
from schemas import GeneralChatSave, GeneralChatOut

router = APIRouter(prefix="/api/chats", tags=["chats"])


@router.get("/companion", response_model=GeneralChatOut)
def get_companion_chat(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return the companion chat history for the current user."""
    chat = db.query(GeneralChat).filter(GeneralChat.user_id == current_user.id).first()
    if not chat:
        return GeneralChatOut(messages=[])
    return GeneralChatOut(messages=chat.data.get("messages", []))


@router.post("/companion", status_code=status.HTTP_200_OK)
def save_companion_chat(
    payload: GeneralChatSave,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save (overwrite) the companion chat history for the current user."""
    chat = db.query(GeneralChat).filter(GeneralChat.user_id == current_user.id).first()
    if chat:
        chat.data = {"messages": payload.messages}
    else:
        chat = GeneralChat(user_id=current_user.id, data={"messages": payload.messages})
        db.add(chat)
    db.commit()
    return {"message": "Chat saved successfully."}
