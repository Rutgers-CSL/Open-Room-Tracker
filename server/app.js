const express = require('express');
const app = express();
const roomRoutes = require('./routes/roomRoutes');

app.use(express.json());
app.use('/api', roomRoutes);

module.exports = app;


