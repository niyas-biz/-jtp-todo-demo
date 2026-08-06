import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    from app.main import app
    from fastapi.testclient import TestClient
    return TestClient(app)


# Existing tests below

import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db import Base, get_db


@pytest.fixture()
def client(tmp_path: Path):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def test_health(client: TestClient) -> None:
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_crud_flow(client: TestClient) -> None:
    created = client.post(
        "/api/todos",
        json={"title": "Buy milk", "description": "2 liters"},
    )
    assert created.status_code == 201
    todo = created.json()
    assert todo["title"] == "Buy milk"
    assert todo["completed"] is False

    listed = client.get("/api/todos")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.patch(f"/api/todos/{todo['id']}", json={"completed": True})
    assert updated.status_code == 200
    assert updated.json()["completed"] is True

    deleted = client.delete(f"/api/todos/{todo['id']}")
    assert deleted.status_code == 204
    assert client.get("/api/todos").json() == []


def test_ui_served(client: TestClient) -> None:
    res = client.get("/")
    assert res.status_code == 200
    assert "Todo Demo" in res.text


def test_due_date(client: TestClient) -> None:
    # Create todo with due date
    due_date = "2024-12-31T00:00:00+00:00"
    created = client.post(
        "/api/todos",
        json={"title": "Test due date", "description": "Check due date", "due_date": due_date},
    )
    assert created.status_code == 201
    todo = created.json()
    assert todo["due_date"] == due_date

    # Update todo due date
    new_due_date = "2025-01-01T00:00:00+00:00"
    updated = client.patch(f"/api/todos/{todo['id']}", json={"due_date": new_due_date})
    assert updated.status_code == 200
    assert updated.json()["due_date"] == new_due_date

    # Remove due date
    updated = client.patch(f"/api/todos/{todo['id']}", json={"due_date": None})
    assert updated.status_code == 200
    assert updated.json()["due_date"] is None

    # List todos and check due date presence
    listed = client.get("/api/todos")
    assert listed.status_code == 200
    todos = listed.json()
    assert any(t.get("due_date") == None or t.get("due_date") == new_due_date for t in todos)


def test_ui_count_badge(client: TestClient) -> None:
    # Initially no todos
    res = client.get("/api/todos")
    assert res.status_code == 200
    assert len(res.json()) == 0

    # Get main page and check badge element exists
    res = client.get("/")
    assert res.status_code == 200
    assert '<span id="total-count" class="badge">' in res.text

    # Add a todo
    created = client.post("/api/todos", json={"title": "Test badge", "description": "desc"})
    assert created.status_code == 201

    # Get todos and check count
    todos = client.get("/api/todos").json()
    assert len(todos) == 1

    # Add another todo
    created2 = client.post("/api/todos", json={"title": "Test badge 2", "description": "desc2"})
    assert created2.status_code == 201

    # Get todos and check count
    todos = client.get("/api/todos").json()
    assert len(todos) == 2

    # Delete a todo
    del_res = client.delete(f"/api/todos/{created.json()['id']}")
    assert del_res.status_code == 204

    # Get todos and check count
    todos = client.get("/api/todos").json()
    assert len(todos) == 1


def test_internal_server_error_handling() -> None:
    # Use a TestClient with raise_server_exceptions=False to capture error response
    with TestClient(app, raise_server_exceptions=False) as client:
        res = client.get("/api/error")
        assert res.status_code == 500
        assert res.json() == {"detail": "Internal Server Error"}
