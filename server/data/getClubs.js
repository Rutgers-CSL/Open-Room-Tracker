const Database = require('better-sqlite3');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

//fetches RSS feed from the getInvolved website
async function fetchRss() {
    const url = 'https://rutgers.campuslabs.com/engage/events.rss';

    const response = await fetch(url, 
        {
            method: 'GET',
            headers: {
                'Accept': 'application/rss+xml',
                'User-Agent': 'OpenRoomTracker (contact: zf153@scarletmail.rutgers.edu)'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
    }

    const xmlText = await response.text();
    return parseRss(xmlText);
}

//converts the xml to javascript
async function parseRss(xml) {
    try {
        const parser = new xml2js.Parser();
        return await parser.parseStringPromise(xml);
    } catch (err) {
        throw new Error("Failed to parse RSS XML: " + err.message);
    }
}

//extracts the event details we want
function extractEvents(rssData) {
    const events = [];
    const items = rssData.rss.channel[0].item;

    for (const item of items) {
        events.push(
            {
                title: item.title?.[0] || "Untitled",
                organization: item["dc:creator"]?.[0] || "Unknown organization",
                location: item["event:location"]?.[0] || "No location listed",
                startDateTime: item["event:startdate"]?.[0] || "Unknown",
                endDateTime: item["event:enddate"]?.[0] || "Unknown"
            }
        );
    }

    return events;
}

//save events into SQLite db
function saveToDB(events) {
    const db = new Database('events.db');
    db.pragma('journal_mode = WAL');

    db.exec(`
        DROP TABLE IF EXISTS Events;
        CREATE TABLE Events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            organization TEXT,
            location TEXT,
            start_datetime TEXT,
            end_datetime TEXT
        );
    `);

    const insert = db.prepare(`
        INSERT INTO Events (title, organization, location, start_datetime, end_datetime)
        VALUES (@title, @organization, @location, @startDateTime, @endDateTime)
    `);

    const insertEvents = db.transaction(events => {
        for (const event of events) {
            insert.run(event);
        }
    });

    insertEvents(events);
    console.log(`Inserted ${events.length} events into database.`);
    db.close();
}

//main
fetchRss()
    .then(rss => {
        const events = extractEvents(rss);
        saveToDB(events);
    })
    .catch(err => console.error("Error fetching or processing RSS:", err));
