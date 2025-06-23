const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized. Redirecting to login.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Erro ao validar token:", err.message); // Log de erro
      return res.status(401).send('Invalid token. Redirecting to login.');
    }

    console.log("Token decodificado:", user); // Debug
    req.user = user;
    next();
  });
};

const authenticateAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).send('Unauthorized. Please log in.');
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send('Invalid token.');
    }

    if (decoded.user_type !== 1) { // Verifica se o usuário é admin
      return res.status(403).send('Access denied. Admins only.');
    }

    req.user = decoded;
    next();
  });
};

console.log('JWT_SECRET:', process.env.JWT_SECRET)

module.exports = { authenticate, authenticateAdmin };