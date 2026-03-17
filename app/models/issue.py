from sqlalchemy import Column, Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.database import Base


class BookIssue(Base):
    __tablename__ = "book_issues"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))

    issue_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, default=datetime.utcnow() + timedelta(days=7))

    returned = Column(Boolean, default=False)
    fine = Column(Integer, default=0)

    user = relationship("User", back_populates="issued_books")
    book = relationship("Book", back_populates="issued_books")