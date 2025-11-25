// Simple Express.js backend server for Dr. V's Lab Reservation System
// Run: npm install express cors
// Then: node server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'reservations.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // Serve static HTML files

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Get all reservations
app.get('/api/reservations', (req, res) => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading reservations:', error);
        res.status(500).json({ error: 'Failed to read reservations' });
    }
});

// Create a reservation
app.post('/api/reservations', (req, res) => {
    try {
        const reservations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const reservation = req.body;
        reservation.id = reservation.id || Date.now().toString();
        reservations.push(reservation);
        fs.writeFileSync(DATA_FILE, JSON.stringify(reservations, null, 2));
        console.log('Reservation created:', reservation.id);
        res.json(reservation);
    } catch (error) {
        console.error('Error saving reservation:', error);
        res.status(500).json({ error: 'Failed to save reservation' });
    }
});

// Delete a reservation
app.delete('/api/reservations/:id', (req, res) => {
    try {
        const reservations = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        const filtered = reservations.filter(r => r.id !== req.params.id);
        fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
        console.log('Reservation deleted:', req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`\n🚀 Dr. V's Lab Reservation Server running on http://localhost:${PORT}`);
    console.log(`📁 Data file: ${DATA_FILE}`);
    console.log(`\nTo enable shared storage, update storage.js:`);
    console.log(`   Change: const API_URL = null;`);
    console.log(`   To:     const API_URL = 'http://localhost:${PORT}/api';\n`);
});










