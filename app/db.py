from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DATABASE_URL = "sqlite:///./todos.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        # Check columns in todos table
        result = conn.execute(text("PRAGMA table_info(todos);"))
        columns = [row[1] for row in result]

        # Add due_date column if missing
        if "due_date" not in columns:
            conn.execute(text("ALTER TABLE todos ADD COLUMN due_date DATETIME;"))

        # Fix any NULL values in completed column by setting them to False
        if "completed" in columns:
            conn.execute(text("UPDATE todos SET completed = 0 WHERE completed IS NULL;"))

        conn.commit()
