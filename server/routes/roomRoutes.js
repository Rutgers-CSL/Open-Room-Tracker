const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const uniqueRoomController = require('../controllers/uniqueRoomController');
const addRoomController = require('../controllers/addCodeController');
const buildingMapController = require('../controllers/buildingMapController');

// Route to get bookings for a specific room and day
router.get('/bookings', roomController.getRoomBookingsByDay);
router.get('/unique', uniqueRoomController.getUniqueBuildings);
router.get('/add', addRoomController.addBuildingCode);
router.get('/building-map', buildingMapController.getBuildingMap);
router.get('/building-abbreviations', buildingMapController.getBuildingAbbreviations);
router.get('/rooms', roomController.getRoomNumbers);


module.exports = router;
