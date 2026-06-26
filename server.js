const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 👇 Serve static files (your index.html)
app.use(express.static(path.join(__dirname)));

// 👇 Handle the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'samanga_requisition'
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// API routes
app.get('/api/requisitions', (req, res) => {
    db.query('SELECT * FROM requisitions ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/requisitions', (req, res) => {
    const { department, itemName, quantity, justification, userID } = req.body;
    const reqNumber = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const sql = `
        INSERT INTO requisitions (requisitionNumber, userID, department, itemName, quantity, justification)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [reqNumber, userID || 1, department, itemName, quantity || 1, justification || ''], (err, result) => {
        if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Requisition added', requisitionNumber: reqNumber, id: result.insertId });
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});