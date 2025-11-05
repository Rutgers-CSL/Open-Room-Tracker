const db = require('../db/connection');

function addBuildingWithCode(building, code) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO BuildingCode (code, building)
            VALUES (?, ?)
        `;
        db.run(query, [code, building], (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        }
        );
    });
}

//an end point to add a room with its corresponding code into the database

exports.addBuildingCode = async (req, res) => {

    const { building, code } = req.query;


    if (!building || !code) {
        return res.status(400).json({ error: 'Building and code are required' });
    }

    try {
        await addBuildingWithCode(building, code);
        res.json({ message: 'Building added successfully' });
    } catch (err) {
        console.error('Error adding building:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// maps.rutgers.edu

//use this endpoint to add each room with its corresponding code into the database using the following endpoint with the example paramaters: http://localhost:3000/api/add?code=ARC&building=Allison Road Classroom