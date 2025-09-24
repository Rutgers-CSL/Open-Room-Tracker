const db = require('../db/connection');

// Function to get schedule for a specific room and day using Promises
function getScheduleForRoomAndDay(room, day) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT start_time, end_time
            FROM Schedule
            WHERE room = ? AND day = ?
            ORDER BY start_time;
        `;

        db.all(query, [room, day], (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// Controller to get all bookings for a specific room and day
exports.getRoomBookingsByDay = async (req, res) => {
    const { room, day } = req.query; // Extract room and day from query parameters

    if (!room || !day) {
        return res.status(400).json({ error: 'Room and day are required' });
    }

    try {
        // Use the helper function to fetch data
        const schedule = await getScheduleForRoomAndDay(room, day);
        res.json(schedule);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
