from pydantic import BaseModel


class BookCreate(BaseModel):
    title: str
    author: str
    description: str
    category_id: int
    
    total_books : int


class BookUpdate(BaseModel):
    title: str
    author: str
    description: str