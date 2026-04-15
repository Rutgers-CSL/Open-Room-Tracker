const db = require('../db/connection');

// Function to get schedule for a specific room and day using Promises
function getScheduleForRoomAndDay(building, roomNumber, day) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT start_time, end_time
            FROM Schedule
            WHERE building = ? AND room_number = ? AND day = ?
            ORDER BY start_time;
        `;

        db.all(query, [building, roomNumber, day], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// Controller to get all bookings for a specific room and day
exports.getRoomBookingsByDay = async (req, res) => {
    const { building, roomNumber, day } = req.query; // Extract building, roomNumber, and day from query parameters

    if (!building || !roomNumber || !day) {
        return res.status(400).json({ error: 'Building, room number, and day are required' });
    }

    try {
        // Use the helper function to fetch data
        const schedule = await getScheduleForRoomAndDay(building, roomNumber, day);
        res.json(schedule);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Function to get unique room numbers for a specific building using Promises
function getRoomNumbersForBuilding(building) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT room_number
            FROM Schedule
            WHERE building = ?
            ORDER BY room_number;
        `;

        db.all(query, [building], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// Controller to get all unique room numbers for a specific building
exports.getRoomNumbers = async (req, res) => {
    const { building } = req.query; 

    if (!building) {
        return res.status(400).json({ error: 'Building code is required' });
    }

    try {
        const roomsData = await getRoomNumbersForBuilding(building);
        // Map the rows to extract just the room numbers into a simple array
        const rooms = roomsData.map(row => row.room_number);
        res.json(rooms);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};