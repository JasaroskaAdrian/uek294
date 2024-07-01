const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const port = 3000;
const secretKey = 'your_secret_key';

app.use(bodyParser.json({ limit: '10mb' })); // Erhöhen Sie die Größenbeschränkung für das Hochladen von Bildern
app.use(express.static('public'));

// In-Memory Database Setup
let db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error('Could not connect to database', err);
  } else {
    console.log('Connected to database');
  }
});

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT, price REAL, categoryId INTEGER, image TEXT, FOREIGN KEY(categoryId) REFERENCES categories(id))");
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT)");
  
  const hashedAdminPassword = bcrypt.hashSync('admin', 10);
  db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?) ON CONFLICT(username) DO NOTHING", ['admin', hashedAdminPassword, 'admin']);
});

// Middleware zur Authentifizierung
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Middleware zur Autorisierung
function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  next();
}

// Route zur Registrierung
app.post('/register', (req, res) => {
  const { username, password, role = 'user' } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.run("INSERT INTO users (username, password, role) VALUES (?, ?, ?)", [username, hashedPassword, role], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, username, role });
  });
});

// Route zur Anmeldung
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = jwt.sign({ username: user.username, role: user.role }, secretKey);
    res.json({ token });
  });
});

// Route zum Zurücksetzen des Passworts
app.post('/reset-password', authenticateToken, (req, res) => {
  const { username, newPassword } = req.body;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.run("UPDATE users SET password = ? WHERE username = ?", [hashedPassword, username], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Password reset successfully' });
  });
});

// Routes for categories (public)
app.get('/categories', (req, res) => {
  db.all("SELECT * FROM categories", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/categories', authenticateToken, authorizeAdmin, (req, res) => {
  const { name } = req.body;
  db.run("INSERT INTO categories (name) VALUES (?)", [name], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name });
  });
});

app.get('/categories/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM categories WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { message: 'Category not found' });
  });
});

app.put('/categories/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  db.run("UPDATE categories SET name = ? WHERE id = ?", [name, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name });
  });
});

app.delete('/categories/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM categories WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Category deleted' });
  });
});

// Routes for products (public)
app.get('/products', (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/products', authenticateToken, authorizeAdmin, (req, res) => {
  const { name, price, categoryId, image } = req.body;
  db.run("INSERT INTO products (name, price, categoryId, image) VALUES (?, ?, ?, ?)", [name, price, categoryId, image], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: this.lastID, name, price, categoryId, image });
  });
});

app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row || { message: 'Product not found' });
  });
});

app.put('/products/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  const { name, price, categoryId, image } = req.body;
  db.run("UPDATE products SET name = ?, price = ?, categoryId = ?, image = ? WHERE id = ?", [name, price, categoryId, image, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, price, categoryId, image });
  });
});

app.delete('/products/:id', authenticateToken, authorizeAdmin, (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Product deleted' });
  });
});

// Task CRUD Operations

// Create - Leere Aufgabe erstellen und zur Liste zurückleiten
app.post('/tasks', (req, res) => {
  const newTask = { id: currentId++, title: '', description: '' };
  tasks.push(newTask);
  res.redirect('/');
});

// Read - Alle Aufgaben lesen
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Read - Einzelne Aufgabe per ID lesen
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Update - Aufgabe aktualisieren
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (task) {
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    res.json(task);
  } else {
    res.status(404).json({ message: 'Task not found' });
  }
});

// Delete - Aufgabe löschen
app.delete('/tasks/:id', (req, res) => {
  tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Serve the login page first
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve the index page
app.get('/mainMenu', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the edit page
app.get('/editProduct/:id/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'edit.html'));
});

// Serve the show page
app.get('/productInfo/:id/show', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'show.html'));
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
