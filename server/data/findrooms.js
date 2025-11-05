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
      day        TEXT NOT NULL
    );
  `);

    const insert = db.prepare(`
    INSERT OR IGNORE INTO Schedule (building, room_number, start_time, end_time, day)
    VALUES (@building, @roomNumber, @start_time, @end_time, @day)
    `);

    const insertRooms = db.transaction((rooms) =>{
        for (const room of rooms){
            insert.run({
                building: room.building,
                roomNumber: room.roomNumber,
                start_time: room.startTime,
                end_time: room.endTime,
                day: room.day
            });
        }
    });

    insertRooms(rooms);
    console.log(`Inserted ${rooms.length} records into the database.`);
    db.close();
}





data = [
  {
    "subject": "013",
    "title": "BIBLE IN ARAMAIC",
    "courseString": "01:013:111",
    "school": {
      "code": "01",
      "description": "School of Arts and Sciences"
    },
    "level": "U",
    "campusCode": "NB",
    "sections": [
      {
        "number": "01",
        "instructorsText": "HABERL, CHARLES",
        "meetingTimes": [
          {
            "campusLocation": "1",
            "roomNumber": "2100",
            "buildingCode": "ABW",
            "meetingDay": "H",
            "startTimeMilitary": "1400",
            "endTimeMilitary": "1520",
            "meetingModeCode": "02"
          },
          {
            "campusLocation": "O",
            "roomNumber": "",
            "buildingCode": "",
            "meetingDay": "",
            "startTimeMilitary": "",
            "endTimeMilitary": "",
            "meetingModeCode": "90"
          }
        ]
      }
    ]
  },
  {
    "subject": "013",
    "title": "ELEMENTARY ARABIC I",
    "courseString": "01:013:140",
    "school": {
      "code": "01",
      "description": "School of Arts and Sciences"
    },
    "level": "U",
    "campusCode": "NB",
    "sections": [
      {
        "number": "01",
        "instructorsText": "ALI, JAMAL",
        "meetingTimes": [
          {
            "campusLocation": "1",
            "roomNumber": "A6",
            "buildingCode": "HH",
            "meetingDay": "M",
            "startTimeMilitary": "1400",
            "endTimeMilitary": "1520",
            "meetingModeCode": "02"
          },
          {
            "campusLocation": "1",
            "roomNumber": "A6",
            "buildingCode": "HH",
            "meetingDay": "W",
            "startTimeMilitary": "1400",
            "endTimeMilitary": "1520",
            "meetingModeCode": "02"
          }
        ]
      },
      {
        "number": "02",
        "instructorsText": "ALI, JAMAL",
        "meetingTimes": [
          {
            "campusLocation": "1",
            "roomNumber": "3100",
            "buildingCode": "ABW",
            "meetingDay": "M",
            "startTimeMilitary": "1550",
            "endTimeMilitary": "1710",
            "meetingModeCode": "02"
          },
          {
            "campusLocation": "1",
            "roomNumber": "3100",
            "buildingCode": "ABW",
            "meetingDay": "W",
            "startTimeMilitary": "1550",
            "endTimeMilitary": "1710",
            "meetingModeCode": "02"
          }
        ]
      }
    ]
  },
  {
    "subject": "620",
    "title": "NEGOTIATIONS",
    "courseString": "22:620:617",
    "school": {
      "code": "22",
      "description": "Rutgers Business School - Newark/New Brunswick (Graduate)"
    },
    "level": "G",
    "campusCode": "OB",
    "sections": [
      {
        "number": "60",
        "instructorsText": "KURTZBERG",
        "meetingTimes": [
          {
            "campusLocation": "Z",
            "roomNumber": "122",
            "buildingCode": "1CP",
            "meetingDay": "W",
            "startTimeMilitary": "1800",
            "endTimeMilitary": "2100",
            "meetingModeCode": "02"
          }
        ]
      }
    ]
  }
]

const rooms = extractRooms(data);
console.log(rooms);
saveToDB(rooms);






