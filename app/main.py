from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.database import Base, engine
# Import models so Base.metadata can create the tables
from app.models import book, category, issue as models_issue, user
from app.routers import auth, books, issue, categories, admin
from fastapi.middleware.cors import CORSMiddleware
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(books.router)
app.include_router(issue.router)
app.include_router(categories.router)
app.include_router(admin.router)


os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/collections_images", StaticFiles(directory="uploads"), name="uploads")
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")