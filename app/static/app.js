const listEl = document.getElementById("todo-list");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const formEl = document.getElementById("todo-form");

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

function createEditForm(todo, li) {
  const div = document.createElement("div");
  div.className = "edit-form";

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.value = todo.title;
  titleInput.maxLength = 200;
  titleInput.required = true;
  titleInput.className = "edit-title";
  div.appendChild(titleInput);

  const descInput = document.createElement("input");
  descInput.type = "text";
  descInput.value = todo.description || "";
  descInput.maxLength = 1000;
  descInput.className = "edit-description";
  div.appendChild(descInput);

  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.value = todo.due_date ? todo.due_date.substring(0, 10) : "";
  dueDateInput.className = "edit-due-date";
  div.appendChild(dueDateInput);

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save";
  saveBtn.className = "secondary save";
  div.appendChild(saveBtn);

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  cancelBtn.className = "secondary cancel";
  div.appendChild(cancelBtn);

  saveBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    if (!title) {
      alert("Title is required.");
      return;
    }
    const description = descInput.value.trim();
    let due_date = dueDateInput.value.trim() || null;
    if (due_date === "") due_date = null;
    await api(`/api/todos/${todo.id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, description, due_date }),
    });
    await load();
  });

  cancelBtn.addEventListener("click", () => {
    load();
  });

  return div;
}

function render(todos) {
  listEl.innerHTML = "";
  const open = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${open} open`;
  emptyEl.classList.toggle("hidden", todos.length > 0);

  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = `todo${todo.completed ? " done" : ""}`;

    if (todo.editing) {
      const editForm = createEditForm(todo, li);
      li.appendChild(editForm);
    } else {
      li.innerHTML = `
        <input type="checkbox" ${todo.completed ? "checked" : ""} aria-label="Toggle complete" />
        <div>
          <p class="title"></p>
          <p class="notes"></p>
          <p class="due-date"></p>
        </div>
        <div class="actions">
          <button type="button" class="secondary edit">Edit</button>
          <button type="button" class="danger delete">Delete</button>
        </div>
      `;
      li.querySelector(".title").textContent = todo.title;
      li.querySelector(".notes").textContent = todo.description || "";
      li.querySelector(".due-date").textContent = todo.due_date ? `Due: ${new Date(todo.due_date).toLocaleDateString()}` : "";

      li.querySelector('input[type="checkbox"]').addEventListener("change", async (e) => {
        await api(`/api/todos/${todo.id}`, {
          method: "PATCH",
          body: JSON.stringify({ completed: e.target.checked }),
        });
        await load();
      });

      li.querySelector(".edit").addEventListener("click", async () => {
        todo.editing = true;
        render(todos);
      });

      li.querySelector(".delete").addEventListener("click", async () => {
        if (!confirm("Delete this task?")) return;
        await api(`/api/todos/${todo.id}`, { method: "DELETE" });
        await load();
      });
    }

    listEl.appendChild(li);
  }
}

async function load() {
  const todos = await api("/api/todos");
  render(todos);
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const due_date = document.getElementById("due_date").value || null;
  if (!title) return;
  await api("/api/todos", {
    method: "POST",
    body: JSON.stringify({ title, description, due_date }),
  });
  formEl.reset();
  await load();
});

load().catch((err) => {
  emptyEl.classList.remove("hidden");
  emptyEl.textContent = `Failed to load todos: ${err.message}`;
});
