const express = require('express')
const router = express.Router()

const {register,login,logout,getCurrentUser} = require('../controllers/authController');
const {authenticateUser} = require('../middleware/authentication');

router.post('/register', register);
router.post('/login', login);
router.delete('/logout', logout);
router.get('/me', authenticateUser, getCurrentUser);

module.exports = router;