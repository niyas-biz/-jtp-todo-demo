# Plan for TODO-14: Improve the todo edit UI

## Summary
Improve editing in the todo UI to use inline editing with Save and Cancel buttons instead of prompt dialogs. After saving, update the list without a full page reload. Keep create, complete, and delete functionality working.

## Changes

### app/static/app.js
- Replace the current prompt-based edit flow with inline editing UI.
- When Edit is clicked, replace the todo text with input fields for title, description, and due date.
- Show Save and Cancel buttons in place of Edit and Delete while editing.
- On Save, send PATCH request to update the todo, then reload the list.
- On Cancel, revert to the original display without saving.
- Keep complete (checkbox) and delete functionality unchanged.

### app/static/styles.css
- Add styles for inline edit inputs and buttons to fit the existing UI style.

### app/static/index.html
- No structural changes needed since inline editing is done dynamically in JS.

### tests/test_todos.py
- Add a UI test for inline editing:
  - Create a todo.
  - Click Edit and verify input fields appear.
  - Change title and description.
  - Click Save.
  - Verify the updated todo appears in the list.
  - Verify create, complete, and delete still work.

## Testing
- Run existing pytest tests.
- Run new UI test for inline editing.
- Fix any test failures before finishing.

## Acceptance Criteria
- Inline edit with Save/Cancel works.
- List updates after save without full page reload.
- Create, complete, and delete still work.
- Pytest passes.