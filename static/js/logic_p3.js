var myMap; // Declare myMap variable globally
var markers = []; // Array to store markers

async function getArtistEvents(apiKey, artistName) {
  const apiUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&artistName=${artistName}`;
  const response = await fetch(apiUrl);
  const json_data = await response.json();
  return Array.isArray(json_data.events) ? json_data.events : [json_data.events];
}

function createMap(eventsJson) {
  if (!myMap) {
    var mapCenter = [32.8283, -98.5795];
    myMap = L.map('map').setView(mapCenter, 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(myMap);
  }

  clearMap(); // Clear existing markers and lines

  markers = []; // Reset markers array

  for (const event of eventsJson) {
    const place = event.location;
    const latitude = place.geo.latitude;
    const longitude = place.geo.longitude;

    const marker = L.marker([latitude, longitude]);
    markers.push(marker);

    const name = event.performer[0].name;
    const performanceDate = event.performer[0]['x-performanceDate'];
    const eventType = event['@type'];

    var popupContent = 'Band: ' + name + ' Type: ' + eventType + ' Date: ' + performanceDate;
    marker.bindPopup(popupContent).addTo(myMap);
  }

  // Create a polyline connecting markers
  if (markers.length > 1) {
    const polyline = L.polyline(markers.map(marker => marker.getLatLng()), { color: 'blue' });
    polyline.addTo(myMap);
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

function clearMap() {
  if (myMap) {
    myMap.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        layer.remove();
      }
    });
  }
}