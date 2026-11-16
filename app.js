const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = 7000;

// SQLite
const db = new Database('todo.db');

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Главная страница
app.get('/', (req, res) => {
    const tasks = db.prepare(`
        SELECT *
        FROM tasks
        ORDER BY completed ASC, id DESC
    `).all();

    res.render('index', { tasks });
});

// Добавление задачи
app.post('/tasks', (req, res) => {
    const title = req.body.title?.trim();

    if (title) {
        db.prepare(`
            INSERT INTO tasks (title)
            VALUES (?)
        `).run(title);
    }

    res.redirect('/');
});

// Изменение статуса
app.post('/tasks/:id/toggle', (req, res) => {
    db.prepare(`
        UPDATE tasks
        SET completed = CASE
            WHEN completed = 0 THEN 1
            ELSE 0
        END
        WHERE id = ?
    `).run(req.params.id);

    res.redirect('/');
});

// Удаление
app.post('/tasks/:id/delete', (req, res) => {
    db.prepare(`
        DELETE FROM tasks
        WHERE id = ?
    `).run(req.params.id);

    res.redirect('/');
});

app.listen(PORT, () => {
    console.log(`To-Do List запущен: http://localhost:${PORT}`);
});