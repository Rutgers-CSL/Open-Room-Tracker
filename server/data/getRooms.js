const Database = require('better-sqlite3');



//Fetches JSON data from Schedule of Classes API
async function fetchJson(){

    const url = 'https://classes.rutgers.edu/soc/api/courses.json?year=2025&term=9&campus=NB';
    const response = await fetch(url,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'OpenRoomTracker (contact: farhan.k0429@gmail.com)'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
    }

    return response.json();
}

// Map single-character day codes to the full day name
function mapDay(dayChar){
    const dayMap = {
        'M': 'Monday',
        'T': 'Tuesday',
        'W': 'Wednesday',
        'H': 'Thursday',
        'F': 'Friday',
        'S': 'Saturday',
        'U': 'Sunday'
    };

    return dayChar in dayMap ? dayMap[dayChar] : 'N/A';
}

//Extracts lecture rooms and meeting times from fetched JSON data.
function extractRooms(data) {
    const rooms = [];
    const seen = new Set();

    for(const course of data){
        if(!course.sections) continue;
        for(const section of course.sections){
            if(!section.meetingTimes) continue;
            for(const meetingTime of section.meetingTimes){
                const startTime = meetingTime.startTimeMilitary;
                const endTime = meetingTime.endTimeMilitary;
                const day = meetingTime.meetingDay;
                const building = meetingTime.buildingCode;
                const roomNumber = meetingTime.roomNumber;

                if(!startTime || !endTime || !day || !building || !roomNumber){
                    continue;
                }

                const key = `${mapDay(day)} ${startTime}-${endTime} at ${building} ${roomNumber}`;
                if(seen.has(key)){
                    continue;//Skip duplicate entries
                }
                seen.add(key);
                rooms.push({
                    day: mapDay(day),
                    startTime: startTime,
                    endTime: endTime,
                    building: building,
                    roomNumber: roomNumber
                });
            }
        }
    }
    return rooms;
}



//Saves extracted rooms into SQLite Database
function saveToDB(rooms){
    const db = new Database('rooms.db');
    db.pragma('journal_mode = WAL');

    db.exec(`
    DROP TABLE IF EXISTS Schedule;
    CREATE TABLE Schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      building  TEXT NOT NULL,
      room_number TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time   TEXT NOT NULL,
      day        TEXT NOT NULL,
      UNIQUE(building, room_number, start_time, end_time, day)
    );
  `);

    const insert = db.prepare(`
    INSERT OR IGNORE INTO Schedule (building, room_number, start_time, end_time, day)
    VALUES (@building, @roomNumber, @start_time, @end_time, @day)
    `);

    const insertRooms = db.transaction((rooms) =>{
        for (const room of rooms){
          try {
            insert.run({
                building: room.building,
                roomNumber: room.roomNumber,
                start_time: room.startTime,
                end_time: room.endTime,
                day: room.day
            });
          } catch (error) {
            console.error(`Failed to insert ${room.building} ${room.roomNumber} (${room.day} ${room.startTime}-${room.endTime}): ${error.message}`);
          }
        }
    });

    insertRooms(rooms);
    console.log(`Inserted ${rooms.length} records into the database.`);
    db.close();
}



//Main workflow
fetchJson().then(data =>{
    const rooms = extractRooms(data);
    saveToDB(rooms);
})
.catch(error =>{
    console.error('Error fetching or processing data:', error);
})






