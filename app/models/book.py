from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    author = Column(String)
    description = Column(String)

    available = Column(Boolean, default=True)
    total_books = Column(Integer, default=1)
    available_books = Column(Integer, default=1)

    is_deleted = Column(Boolean, default=False)


    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="books")
    issued_books = relationship("BookIssue", back_populates="book")