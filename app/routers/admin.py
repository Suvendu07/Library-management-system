from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.models.issue import BookIssue
from app.utils.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
def admin_dashboard(
    db: Session = Depends(get_db),
    admin=Depends(get_admin_user)
):

    total_users = db.query(User).count()
    total_books = db.query(Book).count()
    issued_books = db.query(BookIssue).count()

    return {
        "total_users": total_users,
        "total_books": total_books,
        "issued_books": issued_books
    }