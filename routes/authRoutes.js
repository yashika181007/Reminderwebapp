const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
router.get('/', authController.login);
router.get('/login', authController.login);
router.post('/login', authController.authenticate);
router.get('/logout', authController.logout);
router.get('/dashboard', authController.dashboard);

module.exports = router;
