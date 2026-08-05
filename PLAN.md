# Plan for TODO-11: Filter todos by completed query param

## Summary
Modify the GET /api/todos endpoint in `app/main.py` to accept an optional query parameter `completed` of type `bool | None = None`. This parameter will filter the todos based on their completion status:
- If `completed=true`, return only completed todos.
- If `completed=false`, return only incomplete todos.
- If `completed` is omitted or `None`, return all todos.

Add a pytest in `tests/test_todos.py` that:
- Creates two todos.
- Marks one as completed.
- Asserts that:
  - GET /api/todos returns 2 todos.
  - GET /api/todos?completed=true returns 1 completed todo.
  - GET /api/todos?completed=false returns 1 incomplete todo.

## Detailed Steps

1. Modify `app/main.py`:
   - Update the `list_todos` function to accept a query parameter `completed: bool | None = None`.
   - Adjust the SQLAlchemy query to filter todos based on the `completed` parameter:
     - If `completed` is `True`, filter for completed todos.
     - If `completed` is `False`, filter for incomplete todos.
     - If `completed` is `None`, return all todos.
   - Keep the rest of the function unchanged.

2. Add a new test function in `tests/test_todos.py`:
   - Use the existing test client fixture.
   - Create two todos.
   - Mark one todo as completed using the PATCH endpoint.
   - Perform GET requests to `/api/todos` with and without the `completed` query parameter.
   - Assert the counts and completion status of the returned todos as described.

## Acceptance Criteria
- The GET /api/todos endpoint filters todos correctly based on the `completed` query parameter.
- Omitting the `completed` parameter returns all todos.
- The new pytest passes successfully.
- No unrelated files are changed.
