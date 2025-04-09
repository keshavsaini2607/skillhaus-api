const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

router.get('/users', async (req, res) => {
  try {
    const users = await authService.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ detail: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await authService.loginUser({ username, password });
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ detail: error.message });
  }
});

module.exports = router;