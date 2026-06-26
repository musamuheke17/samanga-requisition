const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// ============================================================
// 👇 THIS IS THE IMPORTANT PART – Serve static files
// ============================================================

// Serve all files from the current directory (where server.js is)
app.use(express.static(path.join(__dirname)));

// Specifically serve index.html on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============================================================
// MySQL Connection (using environment variables from Render)
// ============================================================

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        console.error('Check your environment variables:');
        console.error('DB_HOST:', process.env.DB_HOST);
        console.error('DB_USER:', process.env.DB_USER);
        console.error('DB_NAME:', process.env.DB_NAME);
        console.error('DB_PORT:', process.env.DB_PORT);
        return;
    }
    console.log('✅ Connected to MySQL database');
});

// ============================================================
// API Routes
// ============================================================

// Get all requisitions
app.get('/api/requisitions', (req, res) => {
    db.query('SELECT * FROM requisitions ORDER BY id DESC', (err, results) => {
        if (err) {
            console.error('Query error:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Create a new requisition
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

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📁 Serving files from: ${__dirname}`);
});