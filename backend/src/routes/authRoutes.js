const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { authenticate } = require('../middleware/authenticate');

const router = express.Router();

// Registro de usuário
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [
      username,
      hashedPassword,
    ]);
    res.status(201).send('Usuário registrado com sucesso!');
  } catch (err) {
    console.error('Erro ao registrar usuário:', err.message);
    res.status(500).send('Erro ao registrar usuário.');
  }
});

// Listagem de usuários
router.get('/users', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username FROM users');
    res.status(200).send(users);
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message);
    res.status(500).send('Erro ao listar usuários.');
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).send('Usuário ou senha inválidos.');
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).send('Usuário ou senha inválidos.');
    }
    // Gera o token sem expiração
    const token = jwt.sign(
      { id: user.id, user_type: user.user_type, username: user.username },
      process.env.JWT_SECRET
    );
    
    res.status(200).send({ token, username: user.username });
  } catch (err) {
    console.error('Erro durante o login:', err.message);
    res.status(500).send('Erro durante o login.');
  }
});



// Rota para validar o token
router.post("/validate", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send("Invalid token");
    }
    // Retorne o id, user_type e o username extraído do token
    res.status(200).send({ id: decoded.id, user_type: decoded.user_type, username: decoded.username });
  });
});


// Rota para atualizar a senha do usuário autenticado
router.put('/update-password', authenticate, async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;
  
  if (!newPassword) {
    return res.status(400).send("Nova senha é obrigatória.");
  }
  
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.status(200).send("Senha atualizada com sucesso!");
  } catch (err) {
    console.error("Erro ao atualizar a senha:", err.message);
    res.status(500).send("Erro ao atualizar a senha.");
  }
});

module.exports = router;
