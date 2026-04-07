const Database = require('better-sqlite3');


async function fetchBuildings() {
    const url = 'https://storage.googleapis.com/rutgers-campus-map-prod-public-sync/1775512810917%20(Apr%206,%202026,%206:00%20PM%20EDT)/search.json';
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
    }

    return response.json();
}


function extractMappings(data) {
    const mappings = [];
    
    for (const item of data) {
        if (item.category === 'building' && item.name) {
            mappings.push({
                name: item.name,
                abbr: item.abbr || null 
            });
        }
    }
    
    return mappings;
}

// Save the mappings into the SQLite database
function saveToDB(mappings) {
    // Connect to the database (adjust path if running from a different directory)
    const db = new Database('rooms.db');
    db.pragma('journal_mode = WAL');

    // Create the table and clear it if it already exists so we don't get duplicates
    db.exec(`
        CREATE TABLE IF NOT EXISTS BuildingMap (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            abbr TEXT
        );
        DELETE FROM BuildingMap; 
    `);

    const insert = db.prepare(`
        INSERT INTO BuildingMap (name, abbr)
        VALUES (@name, @abbr)
    `);

    // Use a transaction for fast bulk insertion
    const insertMappings = db.transaction((items) => {
        for (const item of items) {
            try {
                insert.run(item);
            } catch (error) {
                console.error(`Failed to insert ${item.name}: ${error.message}`);
            }
        }
    });

    insertMappings(mappings);
    console.log(`Inserted ${mappings.length} building mappings into the BuildingMap table.`);
    
    db.close();
}

// Main workflow
fetchBuildings()
    .then(data => {
        const mappings = extractMappings(data);
        saveToDB(mappings);
    })
    .catch(error => {
        console.error('Error fetching or processing building data:', error);
    });