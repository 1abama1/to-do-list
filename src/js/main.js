function createTodo(title) {
    return {
        id: crypto.randomUUID(),
        title: title.trim(),
        completed: false,
        createdAt: Date.now()
    };
}

// Состояние приложения
const STORAGE_KEY = 'todo.items.v1';
let state = [];
let filter = 'all';
let query = '';

// DOM элементы
const $list = document.getElementById('list');
const $new = document.getElementById('newTodo');
const $add = document.getElementById('addBtn');
const $filters = document.querySelectorAll('.filter');
const $search = document.getElementById('search');
const $left = document.getElementById('leftCount');
const $clear = document.getElementById('clearCompleted');

// --- ✅ Функция сохранения и загрузки ---
function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch {
            state = [];
        }
    } else {
        state = [];
    }
}

// --- Отрисовка ---
function render() {
    const filtered = state.filter(t => {
        const byFilter = filter === 'all' ||
            (filter === 'active' && !t.completed) ||
            (filter === 'completed' && t.completed);
        const byQuery = t.title.toLowerCase().includes(query);
        return byFilter && byQuery;
    });

    $list.innerHTML = '';
    for (let i = 0; i < filtered.length; i++) {
        const t = filtered[i];
        const li = document.createElement('li');
        li.className = 'item' + (t.completed ? ' completed' : '');
        li.dataset.id = t.id;
        li.style.animationDelay = `${i * 0.05}s`;

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'checkbox';
        cb.checked = t.completed;
        cb.addEventListener('change', () => toggle(t.id));

        const title = document.createElement('div');
        title.className = 'title';
        title.textContent = t.title;
        title.tabIndex = 0;
        title.addEventListener('dblclick', () => startEdit(t.id, title));

        const del = document.createElement('button');
        del.className = 'del';
        del.textContent = '✕';
        del.setAttribute('aria-label', 'Удалить');
        del.addEventListener('click', () => remove(t.id));

        li.append(cb, title, del);
        $list.append(li);
    }

    $left.textContent = state.filter(t => !t.completed).length;
}

// --- Добавление ---
function add() {
    const v = $new.value.trim();
    if (!v) {
        alert('Пожалуйста, заполните поле!');
        return;
    }
    state.unshift(createTodo(v));
    save();
    render();
    $new.value = '';
    updateAddButton();
}

function updateAddButton() {
    const isEmpty = !$new.value.trim();
    $add.disabled = isEmpty;
    $add.style.opacity = isEmpty ? '0.5' : '1';
    $add.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
}

$new.addEventListener('input', updateAddButton);

// --- Обработчики событий ---
$new.addEventListener('keydown', e => {
    if (e.key === 'Enter') add();
});

$add.addEventListener('click', add);

// --- Переключение статуса ---
function toggle(id) {
    state = state.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    save();
    render();
}

// --- Удаление ---
function remove(id) {
    state = state.filter(t => t.id !== id);
    save();
    render();
}

// --- Редактирование ---
function startEdit(id, node) {
    const old = node.textContent;
    const input = document.createElement('input');
    input.className = 'title-edit';
    input.value = old;
    node.replaceWith(input);
    input.focus();
    input.select();

    const finish = () => {
        const val = input.value.trim();
        state = state.map(t => t.id === id ? { ...t, title: val || old } : t);
        save();
        render();
    };

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') finish();
        if (e.key === 'Escape') render();
    });
    input.addEventListener('blur', finish);
}

// --- Обработчики событий ---
$new.addEventListener('keydown', e => {
    if (e.key === 'Enter') add();
});

$add.addEventListener('click', add);

$filters.forEach(btn => btn.addEventListener('click', () => {
    document.querySelector('.filter.active')?.classList.remove('active');
    btn.classList.add('active');
    filter = btn.dataset.filter;
    render();
}));

$search.addEventListener('input', e => {
    query = e.target.value.trim().toLowerCase();
    render();
});

$clear.addEventListener('click', () => {
    state = state.filter(t => !t.completed);
    save();
    render();
});

// --- Инициализация ---
load();
render();
updateAddButton();
