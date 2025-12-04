const express = require('express');
const app = express();
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');

app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use('/api', roomRoutes);

module.exports = app;


