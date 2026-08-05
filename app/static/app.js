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

function render(todos) {
  listEl.innerHTML = "";
  const open = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${open} open`;
  emptyEl.classList.toggle("hidden", todos.length > 0);

  for (const todo of todos) {
    const li = document.createElement("li");
    li.className = `todo${todo.completed ? " done" : ""}`;
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
      const title = prompt("Title", todo.title);
      if (title === null || !title.trim()) return;
      const description = prompt("Notes", todo.description || "");
      if (description === null) return;
      const dueDateInput = prompt("Due date (YYYY-MM-DD)", todo.due_date ? todo.due_date.substring(0, 10) : "");
      if (dueDateInput === null) return;
      let due_date = dueDateInput.trim() || null;
      if (due_date === "") due_date = null;
      await api(`/api/todos/${todo.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: title.trim(), description, due_date }),
      });
      await load();
    });

    li.querySelector(".delete").addEventListener("click", async () => {
      if (!confirm("Delete this task?")) return;
      await api(`/api/todos/${todo.id}`, { method: "DELETE" });
      await load();
    });

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
