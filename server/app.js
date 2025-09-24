const express = require('express');
const app = express();
const roomRoutes = require('./routes/roomRoutes');

app.use(express.json());

// Use the room routes
app.use('/api', roomRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
