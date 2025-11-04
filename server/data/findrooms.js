const url = 'https://classes.rutgers.edu/soc/api/courses.json?year=2025&term=9&campus=NB';

async function fetchJson(){
    const response = await fetch(url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OpenRoomTracker (contact: farhan.k0429@gmail.com)'
            }
        }
    );

    if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
    }

    return response.json();
}


fetchJson().then(data => {
    console.log(data);
}).catch(error => {
    console.error('Error fetching data:', error);
});