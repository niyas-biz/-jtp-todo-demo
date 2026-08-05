PLAN.md

# Plan for TODO-7: Add a Due Date Field to Todos

## Summary
Add an optional `due_date` field to the Todo model and API. The field will be an ISO date string. The UI will show the due date in the todo list. Pytest coverage will be updated to test the new field.

## Details

### Backend Changes
1. **Model Update (app/models.py)**
   - Add a new optional `due_date` field of type `datetime | None` to the `Todo` SQLAlchemy model.
   - Use `DateTime` column type with timezone support and nullable=True.

2. **Schema Update (app/schemas.py)**
   - Add `due_date` as an optional ISO date string field to the Pydantic models:
     - Add to `TodoCreate` as optional (default None).
     - Add to `TodoUpdate` as optional (default None).
     - Add to `TodoOut` as optional.

3. **API Update (app/main.py)**
   - Update the create and update endpoints to accept and handle the `due_date` field.
   - Ensure the field is stripped/validated as needed.
   - Return the `due_date` in the response.

### Frontend Changes
1. **UI Update (app/static/index.html and app/static/app.js)**
   - Add an input field for due date in the todo creation form (type="date").
   - Display the due date in the todo list items.
   - Update the JavaScript to send the due date when creating or updating todos.
   - Show due date in a readable format in the list.

### Tests (tests/test_todos.py)
1. Add tests to cover:
   - Creating a todo with a due date.
   - Updating a todo's due date.
   - Retrieving todos with due dates.
   - UI tests if applicable (currently no UI tests, so focus on API tests).

## Acceptance Criteria
- Todos can store and return `due_date`.
- UI shows the due date.
- All pytest tests pass.

## Notes
- Keep changes minimal and consistent with existing code style.
- Use ISO 8601 date strings for due_date in API and UI.
- Due date is optional; todos without due date should behave as before.

---

This plan will guide the implementation of the due date feature for todos.