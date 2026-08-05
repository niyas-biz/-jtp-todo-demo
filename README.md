# jtp-todo-demo

Simple TODO list (CRUD + UI) used as a test repository for the Jira-to-PR automation product.

Stack: **FastAPI + SQLite + vanilla HTML/CSS/JS + pytest**

## Setup

```powershell
cd D:\project\jtp-todo-demo
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

## Run the app

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8080
```

Open: http://127.0.0.1:8080

## Run tests

```powershell
pytest -q
```

## API

- `GET /api/todos`
- `POST /api/todos`
- `GET /api/todos/{id}`
- `PATCH /api/todos/{id}`
- `DELETE /api/todos/{id}`
