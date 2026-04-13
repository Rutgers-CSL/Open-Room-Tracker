const Database = require('better-sqlite3');
const fetch = require('node-fetch');
const xml2js = require('xml2js');

//Maps some known Rutgers building names (lowercase, partial match) to their building code, used when a room number is found
const BUILDING_MAP = [
    { match: 'vorhees',                   code: 'VH'   },
    { match: 'voorhees',                  code: 'VH'   },
    { match: 'lucy stone',                code: 'LSH'  },
    { match: 'murray hall',               code: 'MU'   },
    { match: 'scott hall',                code: 'SC'   },
    { match: 'hill center',               code: 'HILL' },
    { match: 'beck hall',                 code: 'BECK' },
    { match: 'academic building',         code: 'AB'   },
    { match: 'busch campus center',       code: 'BCC'  },
    { match: 'college ave student',       code: 'CASC' },
    { match: 'rutgers student center',    code: 'RSC'  },
    { match: 'livingston student center', code: 'LSC'  },
    { match: 'civic square',              code: 'CSB'  },
    { match: 'hardenbergh',               code: 'HH'   },
    { match: 'tillett',                   code: 'TIL'  },
    { match: 'loree',                     code: 'LOR'  },
    { match: 'wright',                    code: 'WR'   },
    { match: 'frelinghuysen',             code: 'FH'   },
    { match: 'allison road classroom',    code: 'ARC'  },
];
 
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

//tries to extract a building and roomNumber from a location string, null if not found
function parseVenue(locationStr) {
    if (!locationStr) {
        return null;
    }
    const lower = locationStr.toLowerCase();
 
    //skip URLs and virtual events
    if (lower.startsWith('http') || lower.includes('online') || lower.includes('zoom') || lower.includes('virtual')) {
        return null;
    }
 
    //match explicit "Room 104", "Rm 202", "Suite A145" patterns
    const roomPattern = /(?:room|rm|suite|ste)\.?\s*([A-Za-z]?\d{1,4}[A-Za-z]?)\b/i;
    //bare numbers after a comma: "Murray Hall, 115"
    const bareNumberPattern = /,\s*([A-Za-z]?\d{2,4}[A-Za-z]?)\b/;
 
    let roomNumber = null;
    const roomMatch = locationStr.match(roomPattern);
    if (roomMatch) {
        roomNumber = roomMatch[1].toUpperCase();
    } else {
        const bareMatch = locationStr.match(bareNumberPattern);
        if (bareMatch) {
            roomNumber = bareMatch[1].toUpperCase();
        }
    }
 
    //skip if no room number found
    if (!roomNumber) {
        return null;
    }

    //match to building code
    let building = null;
    for (const entry of BUILDING_MAP) {
        if (lower.includes(entry.match)) {
            building = entry.code;
            break;
        }
    }
 
    //skips if the building is not recognized
    if (!building) {
        return null;
    }
    return { building, roomNumber };
}

//converts GMT date string to { militaryTime, day, date } in US Eastern time
function parseDateTime(gmtStr) {
    if (!gmtStr) {
        return null;
    }
    const date = new Date(gmtStr);
    if (isNaN(date.getTime())) {
        return null;
    }

    //EDT = UTC-4 (Mar–Nov), EST = UTC-5 (Nov–Mar)
    const month = date.getUTCMonth() + 1;
    const offsetHours = (month >= 3 && month <= 11) ? -4 : -5;
 
    const localMs = date.getTime() + offsetHours * 60 * 60 * 1000;
    const local = new Date(localMs);
 
    const hh = String(local.getUTCHours()).padStart(2, '0');
    const mm = String(local.getUTCMinutes()).padStart(2, '0');
    const militaryTime = hh + mm;
 
    const day = DAY_NAMES[local.getUTCDay()];
 
    const yyyy = local.getUTCFullYear();
    const mo   = String(local.getUTCMonth() + 1).padStart(2, '0');
    const dd   = String(local.getUTCDate()).padStart(2, '0');
    const date_str = `${yyyy}-${mo}-${dd}`;
 
    return { militaryTime, day, date: date_str };
}

//extracts room records that have events from parsed RSS and skips events without a room number
function extractRooms(rssData) {
    const rooms = [];
    const seen = new Set();
    const items = rssData?.rss?.channel?.[0]?.item;

    if (!items) {
        console.warn('No items found in RSS feed.');
        return rooms;
    }

    let skipped = 0;
    for (const item of items) {
        //skip cancelled events
        const status = item['status']?.[0] || '';
        if (status.toLowerCase() === 'cancelled') {
            { skipped++; continue; }
        }
        const locationStr = item['location']?.[0] || '';
        const venue = parseVenue(locationStr);
        if (!venue) {
            { skipped++; continue; } 
        }//skip events with no specific rooms
 
        const startGmt = item['start']?.[0] || '';
        const endGmt   = item['end']?.[0]   || '';
        const startParsed = parseDateTime(startGmt);
        const endParsed   = parseDateTime(endGmt);
        if (!startParsed || !endParsed) {
            { skipped++; continue; }
        }

        const key = `${venue.building}-${venue.roomNumber}-${startParsed.militaryTime}-${endParsed.militaryTime}-${startParsed.day}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
 
        rooms.push({
            building:   venue.building,
            roomNumber: venue.roomNumber,
            startTime:  startParsed.militaryTime,
            endTime:    endParsed.militaryTime,
            day:        startParsed.day,
            date:       startParsed.date
        });
    }
 
    console.log(`Skipped ${skipped} events (no specific room number, cancelled, or online).`);
    return rooms;
}

//save events into SQLite db
function saveToDB(events) {
    const db = new Database('server/data/rooms.db');
    db.pragma('journal_mode = WAL');

    const insert = db.prepare(`
        INSERT OR IGNORE INTO Schedule (building, room_number, start_time, end_time, day, date)
        VALUES (@building, @roomNumber, @startTime, @endTime, @day, @date)
    `);

    const insertRooms = db.transaction(rooms => {
        for (const room of rooms) {
            insert.run(room);
        }
    });
 
    insertRooms(rooms);
    console.log(`Inserted ${rooms.length} club event room records into Schedule table.`);
    db.close();
}

//main
fetchRss()
    .then(rss => {
        const rooms = extractRooms(rss);
        if (rooms.length === 0) {
            console.log('No records with a specific room number found in feed.');
            return;
        }
        saveToDB(rooms);
    })
    .catch(err => console.error("Error fetching or processing RSS:", err));
