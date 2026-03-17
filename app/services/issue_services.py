from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.issue import BookIssue
from app.models.book import Book

MAX_BOOKS_PER_USER = 5


def issue_book_services(issue, db: Session, user):
    
    issue_bookks_count = db.query(BookIssue).filter(BookIssue.user_id == user.id,
                                                    BookIssue.returned == False).count()
    
    if issue_bookks_count >= MAX_BOOKS_PER_USER:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"you can't issue more than {MAX_BOOKS_PER_USER} books")
    
    
    book = db.query(Book).filter(Book.id == issue.book_id).first()

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )


    # if not book.available:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Book already issued"
    #     )
    
    existing_issue = db.query(BookIssue).filter(
        BookIssue.book_id == issue.book_id,
        BookIssue.user_id == user.id,
        BookIssue.returned == False
    ).first()

    if existing_issue:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already issued this book"
        )
        
        
        
    if book.available_books is None:
        book.available_books = book.total_books
        
        
    if book.available_books <= 0:
        raise HTTPException(status_code=400, detail="No copies available")

    new_issue = BookIssue(
        user_id=user.id,
        book_id=issue.book_id
    )

    book.available_books = book.available_books - 1

    db.add(new_issue)
    db.commit()
    db.refresh(new_issue)

    return {
        "message" : "Book issue successfully"
    }



def return_book_services(issue_id: int, db: Session, user):

    issue = db.query(BookIssue).filter(BookIssue.id == issue_id).first()

    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue record not found"
        )

    # check ownership
    if issue.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can't return someone else's book"
        )

    # prevent double return
    if issue.returned:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Book already returned"
        )

    issue.returned = True

    # calculate late days
    days_late = (datetime.utcnow() - issue.due_date).days

    fine = 0

    if days_late > 0:
        fine = days_late * 5
        issue.fine = fine

    # fetch book
    book = db.query(Book).filter(Book.id == issue.book_id).first()

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )

    if book.available_books is None:
        book.available_books = 0

    # increase available books
    book.available_books += 1

    # prevent exceeding total books
    if book.available_books > book.total_books:
        book.available_books = book.total_books

    db.commit()

    return {
        "message": "Book returned successfully",
        "fine": fine,
        "available_books": book.available_books
    }




def issued_book_services(db: Session):

    return db.query(BookIssue).all()




def my_books_services(db: Session, user):

    return db.query(BookIssue).filter(
        BookIssue.user_id == user.id
    ).all()