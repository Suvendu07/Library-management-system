from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.book import Book


def create_book_services(db : Session , book_data):
    
    new_book = Book(
    title=book_data.title,
    author=book_data.author,
    description=book_data.description,
    category_id=book_data.category_id,
    total_books=book_data.total_books,
    available_books=book_data.total_books
    )
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    
    return new_book


def get_all_books_services(db : Session, skip: int, limit : int):
    
    books = db.query(Book).offset(skip).limit(limit).all()
    
    return books


def search_books_services(db : Session, query : str):
    
    books = db.query(Book).filter(Book.title.contains(query)).all()
    
    return books


def delete_book_services(db: Session, book_id : int):
    
    book = db.query(Book).filter(Book.id == book_id).first()
    
    if not book:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Book not found")
    
    db.delete(book)
    db.commit()
    
    return {
        "message" : "book deleted"
    }