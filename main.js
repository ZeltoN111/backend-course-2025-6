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

app.use((req, res) => {
    res.status(405).send("Method Not Allowed");
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
