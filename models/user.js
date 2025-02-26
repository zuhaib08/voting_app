const db = require('../config/db');
const bcrypt = require('bcryptjs');


const createUser = async (name, age, mobile, email, address, aadharCardNumber, password) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
        db.query('INSERT INTO Users (name, age, mobile, email, address, aadharCardNumber, password) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [name, age, mobile, email, address, aadharCardNumber, hashedPassword], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};


const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Users WHERE email = ?', [email], (err, results) => {
            if (err) return reject(err);
            resolve(results[0]);
        });
    });
};


const validatePassword = (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = { createUser, findUserByEmail, validatePassword };
