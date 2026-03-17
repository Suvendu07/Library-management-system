from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from .config import settings


DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"


engine = create_engine(DATABASE_URL)

sessionlocal = sessionmaker(bind=engine, autoflush=False, autocommit = False)

Base = declarative_base()


def get_db():
    db = sessionlocal()
    
    try:
        yield db
        
    finally:
        db.close()