from datetime import datetime
from pydantic import BaseModel, Field


class TodoCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=1000)
    due_date: datetime | None = None


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=1000)
    completed: bool | None = None
    due_date: datetime | None = None


class TodoOut(BaseModel):
    id: int
    title: str
    description: str
    completed: bool
    due_date: datetime | None = None

    model_config = {"from_attributes": True, "json_encoders": {datetime: lambda v: v.isoformat(timespec='seconds') + '+00:00' if v else None}}
