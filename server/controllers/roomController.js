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
