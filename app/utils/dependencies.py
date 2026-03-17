from fastapi import Depends, HTTPException, Request, Cookie
from sqlalchemy.orm import Session
from jose import jwt
from app.database import get_db
from app.models.user import User
from app.utils.token import SECRET_KEY, ALGORITHM


def get_current_user(request : Request, db : Session = Depends(get_db)):
    
    token = request.cookies.get("access_token")
    
    payload = jwt.decode(token, SECRET_KEY, algorithms=ALGORITHM)
    
    user_id = payload.get("user_id")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Credential")
    
    return user


def get_admin_user(user : User = Depends(get_current_user)):
    
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin Only")
    
    return user