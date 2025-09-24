const db = require('../db/connection');

// Function to get schedule for a specific room and day using Promises
function getScheduleForUniqueRooms() {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT room
            FROM Schedule
        `;

        db.all(query, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
}

// Controller to get all bookings for a specific room and day
exports.getUniqueRooms = async (req, res) => {

    try {
        // Use the helper function to fetch data
        const schedule = await getScheduleForUniqueRooms();
        rooms = []
        for(i = 0; i < schedule.length; i++){
            rooms.push(schedule[i].room.split("-")[0])
        }
        rooms = [...new Set(rooms)]
        rooms.sort()

        console.log(rooms)
        console.log(rooms.length)
        res.json(rooms);
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//maps.rutgers.edu