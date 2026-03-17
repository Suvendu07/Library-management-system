from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.category import Category
from app.schema.category_schema import CategoryCreate
from app.services.category_service import get_category_Service, create_category_services, delete_category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


# Create category
@router.post("/")
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    
    return create_category_services(category, db)


# Get all categories
@router.get("/")
def get_categories(db: Session = Depends(get_db)):

    return get_category_Service(db)


# Delete category
@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):

    return delete_category_service(category_id, db)