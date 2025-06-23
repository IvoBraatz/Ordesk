const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./src/routes/authRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Middleware para desativar cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Surrogate-Control', 'no-store');
    next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir uploads de forma estática
const uploadPath = path.join(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(uploadPath));

// Servir arquivos estáticos do frontend
const frontendPath = path.join(__dirname, '../dist'); // Ajuste conforme a estrutura do projeto
app.use(express.static(frontendPath));

// Rotas do backend
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
app.use('/services', serviceRoutes);
app.use('/dashboards', dashboardRoutes);

// Para qualquer rota que não seja do backend, envie o index.html do frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
  

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`✅ Server is running on ${BASE_URL}`);
});
