const db = require('../db/connection');

function addRoomWithCode(room, code) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO Rooms (room, code)
            VALUES (?, ?)
        `;
        db.run(query, [room, code], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        }
        );
    });
}

//an end point to add a room with its corresponding code into the database

exports.addRoom = async (req, res) => {

    const { room, code } = req.query;


    if (!room || !code) {
        return res.status(400).json({ error: 'Room and code are required' });
    }

    try {
        await addRoomWithCode(room, code);
        res.json({ message: 'Room added successfully' });
    } catch (err) {
        console.error('Error adding room:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// maps.rutgers.edu

//use this endpoint to add each room with its corresponding code into the database using the following endpoint with the example paramaters: http://localhost:3000/api/add?room=Allison Road Classroom&code=ARC