const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('crypto');
const bodyParser = require('body-parser');

const app = express();
const CACHE_DIR = path.resolve("cache");

if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    console.log("Створено теку cache/");
}

const upload = multer({ dest: CACHE_DIR });

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

let inventory = [];

app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description } = req.body;

    if (!inventory_name) {
        return res.status(400).json({ error: "inventory_name is required" });
    }

    const item = {
        id: randomUUID(),
        name: inventory_name,
        description: description || "",
        photo: req.file ? req.file.filename : null
    };

    inventory.push(item);

    return res.status(201).json({
        message: "Created",
        id: item.id
    });
});

app.get('/inventory', (req, res) => {
    res.json(inventory);
});

app.get('/inventory/:id', (req, res) => {
    const item = inventory.find((x) => x.id === req.params.id);

    if (!item) {
        return res.status(404).json({ error: "Not found" });
    }

    res.json(item);
});

app.put('/inventory/:id', (req, res) => {
    const item = inventory.find((x) => x.id === req.params.id);

    if (!item) {
        return res.status(404).json({ error: "Not found" });
    }

    const { name, description } = req.body;

    if (name) item.name = name;
    if (description) item.description = description;

    res.json({ message: "Updated", item });
});

app.get('/inventory/:id/photo', (req, res) => {
    const item = inventory.find((x) => x.id === req.params.id);

    if (!item || !item.photo) {
        return res.status(404).json({ error: "Photo not found" });
    }

    const photoPath = path.join(CACHE_DIR, item.photo);

    if (!fs.existsSync(photoPath)) {
        return res.status(404).json({ error: "Photo file missing" });
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.sendFile(photoPath);
});

app.put('/inventory/:id/photo', upload.single('photo'), (req, res) => {
    const item = inventory.find((x) => x.id === req.params.id);

    if (!item) {
        return res.status(404).json({ error: "Not found" });
    }

    item.photo = req.file.filename;

    res.json({ message: "Photo updated" });
});

app.delete('/inventory/:id', (req, res) => {
    const index = inventory.findIndex((x) => x.id === req.params.id);

    if (index === -1) {
        return res.status(404).json({ error: "Not found" });
    }

    inventory.splice(index, 1);

    res.json({ message: "Deleted" });
});

app.get('/RegisterForm.html', (req, res) => {
    res.sendFile(path.resolve("RegisterForm.html"));
});

app.get('/SearchForm.html', (req, res) => {
    res.sendFile(path.resolve("SearchForm.html"));
});

app.post('/search', (req, res) => {
    const { id, has_photo } = req.body;

    const item = inventory.find((x) => x.id === id);

    if (!item) {
        return res.status(404).send("Not Found");
    }

    let result = `Name: ${item.name}\nDescription: ${item.description}`;

    if (has_photo) {
        result += `\nPhoto: /inventory/${item.id}/photo`;
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(result);
});

app.use((req, res) => {
    res.status(405).send("Method Not Allowed");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
