from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import session
from app.database import get_db
from app.schema.book_schema import BookCreate
from app.utils.dependencies import get_admin_user
from app.services.book_service import create_book_services, get_all_books_services, search_books_services, delete_book_services


router = APIRouter(
    prefix="/books",
    tags=["Books"]
)


@router.post("/")
def add_book(book : BookCreate, db : session = Depends(get_db), admin = Depends(get_admin_user)):
    
    return create_book_services(db , book)



@router.get("/")
def get_books(skip : int = 0, limit : int = 10,db : session = Depends(get_db)):
    
    return get_all_books_services(db, skip, limit)




@router.get("/search")
def search_books(query : str = Query(...), db : session = Depends(get_db)):
    
    
    return search_books_services(db, query)




@router.delete("/{id}")
def delete_book(id : int, db : session = Depends(get_db), admin = Depends(get_admin_user)):
    
    return delete_book_services(db, id)