from fastapi import APIRouter, Depends, Response, BackgroundTasks
from app.schema.user_schema import UserCreate, UserLogin
from app.database import get_db
from sqlalchemy.orm import Session
from app.services.auth_service import user_create, login_user
from app.utils.email_ser import send_email
import shutil
import uuid
import os
from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

@router.post("/register")
def user_register(user : UserCreate, background_task : BackgroundTasks,db : Session = Depends(get_db)):
    

    new_user = user_create(user, db)
    
    sub = "Welcome to Library system"
    
    message = f"""
Hello {new_user.username},

Welcome to our Library Management System 📚

Your account has been successfully created.

Happy Reading!
"""

    background_task.add_task(
    send_email,
    new_user.email,
    sub,
    message
    )
    
    return {
        "message" : "Registerd successfuly"
    }


@router.post("/login")
def user_login(user: UserLogin, respone : Response,db: Session = Depends(get_db)):

    return login_user(user, db, respone)


@router.get("/me")
def get_current_user_profile(user = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }