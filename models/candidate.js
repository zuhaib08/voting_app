const db = require('../config/db');

const getAllCandidates = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Candidates', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const getAllVotes = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM votes', (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

const addCandidate = (name, party, age) => {
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Candidates (name, party, age) VALUES (?, ?, ?)', [name, party, age], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = { getAllCandidates, addCandidate,getAllVotes };
