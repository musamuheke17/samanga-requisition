const express = require('express');
const mysql = require('mysql2');  // or 'mysql' if you switched
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // default XAMPP user
    password: '',          // default is empty (no password)
    database: 'samanga-requisition'
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// Get all requisitions
app.get('/api/requisitions', (req, res) => {
    db.query('SELECT * FROM requisitions ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Create new requisition
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
        res.status(201).json({ 
            message: 'Requisition added', 
            requisitionNumber: reqNumber,
            id: result.insertId
        });
    });
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});