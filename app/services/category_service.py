from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.category import Category




def create_category_services(category , db: Session):
    
    existing = db.query(Category).filter(Category.name == category.name).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="categories already exist")
    
    
    new_category = Category(
        name = category.name
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    
    return new_category




def get_category_Service(db : Session):
    
    category = db.query(Category).all()
    
    return category



def delete_category_service(category_id , db : Session):
    
    category = db.query(Category).filter(Category.id == category_id).first()
    
    if not category:
        raise HTTPException(status_code=404, detail="categoy not found")
    
    db.delete(category)
    db.commit()
    
    return {
        "message" : "category deleted"
    }