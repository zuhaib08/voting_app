const express = require('express');
const jwt = require('jwt-simple');

const { createUser, findUserByEmail, validatePassword } = require('../models/user');
const router = express.Router();
require('dotenv').config();


router.post('/register', async (req, res) => {
    const { name, age, mobile, email, address, aadharCardNumber, password } = req.body;

    try {
        const user = await createUser(name, age, mobile, email, address, aadharCardNumber, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isValidPassword = await validatePassword(password, user.password);
        if (!isValidPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const payload = { userId: user.id };
        const token = jwt.encode(payload, process.env.SECRET_KEY);
        const ID = user.id
        res.json({ message: 'Login successful', token , ID });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
