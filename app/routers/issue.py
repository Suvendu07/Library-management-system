from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schema.issue_schema import IssueBook
from app.utils.dependencies import get_current_user
from app.services.issue_services import (
    issued_book_services,
    my_books_services,
    return_book_services,
    issue_book_services
)

router = APIRouter(
    prefix="/issue",
    tags=["Issue"]
)


@router.post("/book")
def issue_book(
    issue: IssueBook,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return issue_book_services(issue, db, user)


@router.post("/return-book")
def return_book(
    issue_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return return_book_services(issue_id, db, user)


@router.get("/issued-books")
def issued_books(db: Session = Depends(get_db)):

    return issued_book_services(db)


@router.get("/my-books")
def my_books(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):

    return my_books_services(db, user)