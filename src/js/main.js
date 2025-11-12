const API_URL = "https://69149e653746c71fe0490048.mockapi.io/api/v1/todo";

const $list = document.getElementById('list');
const $new = document.getElementById('newTodo');
const $add = document.getElementById('addBtn');
const $filters = document.querySelectorAll('.filter');
const $search = document.getElementById('search');
const $left = document.getElementById('leftCount');
const $clear = document.getElementById('clearCompleted');

let state = [];
let filter = 'all';
let query = '';

async function loadTodos() {
  const res = await fetch(API_URL);
  state = await res.json();
  render();
}

async function addTodo() {
  const title = $new.value.trim();
  if (!title) return;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false })
  });
  const newTodo = await res.json();
  state.unshift(newTodo);
  render();
  $new.value = "";
}

async function toggleTodo(id, completed) {
  await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed })
  });
  const item = state.find(t => t.id == id);
  item.completed = completed;
  render();
}

async function deleteTodo(id) {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  state = state.filter(t => t.id != id);
  render();
}

async function clearCompleted() {
  const completed = state.filter(t => t.completed);
  for (const todo of completed) {
    await fetch(`${API_URL}/${todo.id}`, { method: "DELETE" });
  }
  state = state.filter(t => !t.completed);
    render();
}

async function updateTitle(id, title) {
  const item = state.find(t => t.id == id);
  if (!item) return;

  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...item, title })
  });

  if (res.ok) {
    const updated = await res.json();
    Object.assign(item, updated);
    render();
  } else {
    render();
  }
}

function startEdit(todo, node) {
  const original = todo.title;
  const input = document.createElement("input");
  input.type = "text";
  input.className = "title-edit";
  input.value = original;
    node.replaceWith(input);
    input.focus();
    input.select();

  let finished = false;

  const cleanup = () => {
    finished = true;
    input.removeEventListener("keydown", onKeydown);
    input.removeEventListener("blur", onBlur);
  };

  const commit = async () => {
    if (finished) return;
    cleanup();
    const value = input.value.trim();
    if (!value) {
      render();
      return;
    }
    if (value === original) {
      render();
      return;
    }
    await updateTitle(todo.id, value);
  };

  const cancel = () => {
    cleanup();
        render();
    };

  const onKeydown = e => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  const onBlur = () => {
    commit();
  };

  input.addEventListener("keydown", onKeydown);
  input.addEventListener("blur", onBlur);
}

function render() {
  let filtered = state;
  if (filter === 'active') filtered = filtered.filter(t => !t.completed);
  if (filter === 'completed') filtered = filtered.filter(t => t.completed);
  if (query) filtered = filtered.filter(t => t.title.toLowerCase().includes(query));

  $list.innerHTML = "";
  filtered.forEach(t => {
    const li = document.createElement('li');
    li.className = "item" + (t.completed ? " completed" : "");
    li.dataset.id = t.id;
    li.innerHTML = `
      <input type="checkbox" class="checkbox" ${t.completed ? "checked" : ""}>
      <div class="title" contenteditable="false">${t.title}</div>
      <button class="del">✕</button>
    `;
    li.querySelector(".checkbox").addEventListener("change", e => toggleTodo(t.id, e.target.checked));
    li.querySelector(".del").addEventListener("click", () => deleteTodo(t.id));
    li.querySelector(".title").addEventListener("dblclick", () => startEdit(t, li.querySelector(".title")));
    $list.append(li);
  });

  $left.textContent = state.filter(t => !t.completed).length;
}

$add.addEventListener("click", addTodo);
$new.addEventListener("keydown", e => { if (e.key === "Enter") addTodo(); });
$filters.forEach(btn => btn.addEventListener("click", () => {
  document.querySelector(".filter.active")?.classList.remove("active");
  btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
}));
$search.addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); render(); });
$clear.addEventListener("click", clearCompleted);

loadTodos();
