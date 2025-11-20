const API_URL = "https://69149e653746c71fe0490048.mockapi.io/api/v1/todo";

let userId = sessionStorage.getItem("currentUser");
let user = null;
let state = [];
let filter = "all";
let query = "";

if (!userId) window.location.href = "login.html";

// DOM
const $list = document.getElementById('list');
const $new = document.getElementById('newTodo');
const $add = document.getElementById('addBtn');
const $filters = document.querySelectorAll('.filter');
const $search = document.getElementById('search');
const $left = document.getElementById('leftCount');
const $clear = document.getElementById('clearCompleted');
const $logout = document.getElementById('logoutBtn');

// LOGOUT
$logout.onclick = () => {
    sessionStorage.removeItem("currentUser");
    window.location.href = "login.html";
};

// ---- LOAD USER AND TASKS ----
async function loadTodos() {
    const users = await (await fetch(API_URL)).json();

    user = users.find(u => u.id === userId);

    if (!user) {
        alert("Пользователь не найден");
        sessionStorage.removeItem("currentUser");
        window.location.href = "login.html";
        return;
    }

    state = user.todolist || [];
    render();
}

async function saveTodos() {
    await fetch(`${API_URL}/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    });
}

// ---- ADD ----
async function addTodo() {
    const title = $new.value.trim();
    if (!title) return;

    const newItem = {
        id: Date.now().toString(),
        title,
        completed: false
    };

    user.todolist.unshift(newItem);
    state = user.todolist;

    await saveTodos();
    render();

    $new.value = "";
}

// ---- TOGGLE ----
async function toggleTodo(id, completed) {
    const todo = user.todolist.find(t => t.id == id);
    todo.completed = completed;

    await saveTodos();
    render();
}

// ---- DELETE ----
async function deleteTodo(id) {
    user.todolist = user.todolist.filter(t => t.id != id);
    state = user.todolist;

    await saveTodos();
    render();
}

// ---- EDIT ----
async function updateTitle(id, title) {
    const todo = user.todolist.find(t => t.id == id);
    todo.title = title;

    await saveTodos();
    render();
}

function startEdit(todo, node) {
    const input = document.createElement("input");
    input.className = "title-edit";
    input.value = todo.title;

    node.replaceWith(input);
    input.focus();

    input.onblur = async () => {
        const val = input.value.trim();
        if (val) await updateTitle(todo.id, val);
        else render();
    };
}

// ---- OK ----
function render() {
    let filtered = [...state];

    if (filter === "active") filtered = filtered.filter(t => !t.completed);
    if (filter === "completed") filtered = filtered.filter(t => t.completed);

    if (query) filtered = filtered.filter(t => t.title.toLowerCase().includes(query));

    $list.innerHTML = "";

    filtered.forEach(t => {
        const li = document.createElement("li");
        li.className = "item" + (t.completed ? " completed" : "");

        li.innerHTML = `
            <input type="checkbox" class="checkbox" ${t.completed ? "checked" : ""}>
            <div class="title">${t.title}</div>
            <button class="del">✕</button>
        `;

        li.querySelector(".checkbox").onchange = e => toggleTodo(t.id, e.target.checked);
        li.querySelector(".del").onclick = () => deleteTodo(t.id);
        li.querySelector(".title").ondblclick = () => startEdit(t, li.querySelector(".title"));

        $list.append(li);
    });

    $left.textContent = state.filter(t => !t.completed).length;
}

// EVENTS
$add.onclick = addTodo;
$new.onkeydown = e => { if (e.key === "Enter") addTodo(); };
$filters.forEach(btn =>
    btn.onclick = () => {
        document.querySelector(".filter.active")?.classList.remove("active");
        btn.classList.add("active");
        filter = btn.dataset.filter;
        render();
    }
);
$search.oninput = e => { query = e.target.value.trim().toLowerCase(); render(); };
$clear.onclick = () => {
    user.todolist = user.todolist.filter(t => !t.completed);
    state = user.todolist;
    saveTodos();
    render();
};

// INIT
loadTodos();
