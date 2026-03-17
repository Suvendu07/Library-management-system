from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.hashing import hash_password, verify_password
from app.utils.token import create_access_token



def user_create(user , db : Session):
    
    new_user = User(
        username = user.username,
        email = user.email,
        password = hash_password(user.password)
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user
    
 
 
def login_user(user_data, db: Session, response):

    user = db.query(User).filter(User.username == user_data.username).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    access_token = create_access_token(data={"user_id": user.id})
    
    response.set_cookie(key="access_token", value=access_token)

    return {
        "message" : "Login successfuly"
    }