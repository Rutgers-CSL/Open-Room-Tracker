const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const uniqueRoomController = require('../controllers/uniqueRoomController');
const addRoomController = require('../controllers/addRoomController');

// Route to get bookings for a specific room and day
router.get('/bookings', roomController.getRoomBookingsByDay);
router.get('/unique', uniqueRoomController.getUniqueRooms);
router.get('/add', addRoomController.addRoom);


module.exports = router;
