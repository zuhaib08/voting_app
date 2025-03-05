const express = require('express');
const jwt = require('jwt-simple');
const { getAllCandidates, getAllVotes } = require('../models/candidate');
const { recordVote, updateVoteCount } = require('../models/vote');
const router = express.Router();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    try {
        const decoded = jwt.decode(token, process.env.SECRET_KEY);
        req.userId = decoded.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};


router.get('/candidates', async (req, res) => {
    try {
        const candidates = await getAllCandidates();
        res.json({ candidates });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/votes', async (req, res) => {
    try {
        const votes = await getAllVotes();
        const candidates = await getAllCandidates();
        const voterIds = votes.map(vote => vote.user_id);
        const candidateIds = votes.map(vote => vote.candidate_id);
        const getPartyNames = (candidateIds, candidates) => {
            return candidateIds.map(candidateId => {
                const candidate = candidates.find(c => c.id === candidateId);
                return candidate ? candidate.name : 'Unknown'; 
            });
        };

        const candidateNames = getPartyNames(candidateIds, candidates);

        res.json({ voterIds, candidateNames });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/admin/votes', verifyToken, async (req, res) => {
    try {
        const votes = await getAllVotes();
        const candidates = await getAllCandidates();

        const candidateVotes = candidates.map(candidate => {
            const voteCount = votes.filter(vote => vote.candidate_id === candidate.id).length;
            return { ...candidate, voteCount };
        });

        res.json({ totalVotes: votes.length, candidateVotes });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



router.post('/:candidateId', verifyToken, async (req, res) => {
    const candidateId = req.params.candidateId;
    const userId = req.userId;

    try {
        await recordVote(userId, candidateId);
        await updateVoteCount(candidateId);
        res.status(200).json({ message: 'Vote recorded successfully' });
    } catch (err) {
        res.status(500).json(err.message);
    }
});
router.delete('/vote/:voteId', verifyToken, async (req, res) => {
    const voteId = req.params.voteId;

    try {
        // Fetch the vote to get the candidate_id
        const vote = await getVoteById(voteId);
        if (!vote) return res.status(404).json({ message: 'Vote not found' });

        // Delete the vote
        await deleteVote(voteId);

        // Decrement the voteCount for the candidate
        await db.query('UPDATE Candidates SET voteCount = voteCount - 1 WHERE id = ?', [vote.candidate_id]);

        res.json({ message: 'Vote deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
