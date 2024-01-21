



async function getArtistEvents(apiKey, artistName) {
    const apiUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&artistName=${artistName}`;
    const response = await fetch(apiUrl);
    const json_data = await response.json();
    return Array.isArray(json_data.events) ? json_data.events : [json_data.events];
    }
  
    //create map and add markers
    function createMap(eventsJson) {
    var mapCenter = [32.8283, -98.5795];
    var myMap = L.map('map').setView(mapCenter, 4);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(myMap);
  
    // iterate over eventsJson
    for (const event of eventsJson) {
        const place = event.location;
        const venue = event.location.name;
        const latitude = place.geo.latitude;
        const longitude = place.geo.longitude;
        const name = event.performer[0].name;
        const performanceDate = event.performer[0]['x-performanceDate'];
        const eventType = event['@type'];
  
        // pop-up
        var popupContent = 'Band: ' + name + ' Type: ' + eventType + ' Date: ' + performanceDate + ' Venue: ' + venue;
        var marker = L.marker([latitude, longitude]).bindPopup(popupContent);
  
        // Add marker
        marker.addTo(myMap);
    }
    }
        


    function searchArtist() {
        const artistInput = document.getElementById('artistInput');
        const newArtistName = artistInput.value;
  
        const apiKey = "bdf2d4f5-f2b8-4dba-91bf-0c2c5d8fadf3";
        getArtistEvents(apiKey, newArtistName)
          .then(createMap)
          .catch(error => console.error(error));
      }

      