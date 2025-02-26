const db = require('../config/db');

const recordVote = (userId, candidateId) => {
    return new Promise((resolve, reject) => {
        
        db.query('SELECT * FROM Votes WHERE user_id = ? LIMIT 1', [userId], (err, results) => {
            if (err) return reject(err);

            if (results.length > 0) {
                return reject(new Error('You have already voted.'));
            }

    
            db.query('INSERT INTO Votes (user_id, candidate_id) VALUES (?, ?)', [userId, candidateId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    });
};



const updateVoteCount = (candidateId) => {
    return new Promise((resolve, reject) => {
        db.query('UPDATE Candidates SET voteCount = voteCount + 1 WHERE id = ?', [candidateId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

module.exports = { recordVote, updateVoteCount };
