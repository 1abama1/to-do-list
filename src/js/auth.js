const API_URL = "https://69149e653746c71fe0490048.mockapi.io/api/v1/todo";

const $user = document.getElementById("username");
const $pass = document.getElementById("password");
const $login = document.getElementById("loginBtn");
const $reg = document.getElementById("registerBtn");
const $info = document.getElementById("info");

$login.onclick = login;
$reg.onclick = register;

function msg(t) { $info.textContent = t; }

// ---------- REGISTER ----------
async function register() {
    const username = $user.value.trim();
    const password = $pass.value.trim();

    if (!username || !password) return msg("Введите логин и пароль");

    const users = await (await fetch(API_URL)).json();
    if (users.find(u => u.username === username))
        return msg("Пользователь уже существует");

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            username,
            password,
            todolist: []
        })
    });

    if (res.ok) msg("Аккаунт создан! Теперь войдите.");
}

// ---------- LOGIN ----------
async function login() {
    const username = $user.value.trim();
    const password = $pass.value.trim();

    const users = await (await fetch(API_URL)).json();

    const user = users.find(
        u => u.username === username && u.password === password
    );

    if (!user) return msg("Неверный логин или пароль");

    // сохраняем id выбранного пользователя
    sessionStorage.setItem("currentUser", user.id);

    window.location.href = "index.html";
}
