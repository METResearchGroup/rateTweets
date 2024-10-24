const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// set available participantIDs to array from 1-350
let availableIDs = Array.from({length: 350}, (_, i) => i + 1);
let assignments = new Map();

// middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// serve HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// endpoint to get participantID; assigns and returns a participantID to a prolificID
app.get('/get-participant-id', (req, res) => {
    const prolificID = req.query.prolific_id;  // needed to change from prolificID to prolific_id

    if (!prolificID) {
        return res.status(400).json({ error: 'No Prolific ID provided' });
    }

    if (assignments.has(prolificID)) {
        res.json({ participantID: assignments.get(prolificID) });
    } else if (availableIDs.length > 0) {
        const participantID = availableIDs.shift();
        assignments.set(prolificID, participantID);
        res.json({ participantID });
    } else {
        res.status(429).json({ error: 'No more participant IDs available' });
    }
});

// endpoint to save data
app.post('/save-data', (req, res) => {
    const data = req.body;
    const filename = `data_${Date.now()}.csv`;
    
    fs.writeFile(path.join(__dirname, 'data', filename), data.csv, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving data');
        } else {
            res.send('Data saved successfully');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});