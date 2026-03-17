from pydantic import BaseModel


class IssueBook(BaseModel):
    # user_id: int
    book_id: int


class ReturnBook(BaseModel):
    issue_id: int