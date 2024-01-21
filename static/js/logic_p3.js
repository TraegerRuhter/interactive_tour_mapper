<<<<<<< Updated upstream
// Initialize the Leaflet map
let myMap = L.map('map').setView([37.8, -96], 4);  // Set your preferred default center and zoom level

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(myMap);

// Fetch data from the Flask API and update the map
function fetchDataAndPlot() {
    let band = document.getElementById('band-name').value;
    let yearRange = document.getElementById('year-range').value;
    let tourName = document.getElementById('tour-name').value;

    fetch(`/api/tours?band=${band}&year_range=${yearRange}&tour_name=${tourName}`)
        .then(response => response.json())
        .then(data => {
            plotDataOnMap(data);
        });
}

// Function to plot data on the map
function plotDataOnMap(data) {
    // Clear existing markers
    myMap.eachLayer(function (layer) {
        if (!!layer.toGeoJSON) {
            myMap.removeLayer(layer);
        }
    });

    // Plot new data
    data.forEach(tour => {
        L.marker([tour.latitude, tour.longitude])  // Assuming latitude and longitude are part of your data
            .bindPopup(`<strong>${tour.band_name}</strong><br>${tour.date}<br>${tour.location}`)
            .addTo(myMap);
    });
}

// Add event listener for the button click
document.getElementById('fetch-data').addEventListener('click', fetchDataAndPlot);
=======
async function getArtistEvents(apiKey, artistName) {
    const apiUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&artistName=${artistName}`;
    const response = await fetch(apiUrl);
    const json_data = await response.json();
    return Array.isArray(json_data.events) ? json_data.events : [json_data.events];
}

// Create map and add markers
function createMap(eventsJson) {
    var mapCenter = [32.8283, -98.5795];
    var myMap = L.map('map').setView(mapCenter, 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(myMap);

    // Iterate over eventsJson
    for (const event of eventsJson) {
        const place = event.location;
        const venue = event.location.name;
        const latitude = place.geo.latitude;
        const longitude = place.geo.longitude;
        const name = event.performer[0].name;
        const performanceDate = event.performer[0]['x-performanceDate'];
        const eventType = event['@type'];

        // Pop-up content
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

// Collapse Panel
document.getElementById('collapsePanel').addEventListener('click', function() {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.style.width = '0';
    document.getElementById('expandPanel').style.display = 'block';
});

// Expand Panel
document.getElementById('expandPanel').addEventListener('click', function() {
    var sidePanel = document.getElementById('sidePanel');
    sidePanel.style.width = '300px'; // Match the width specified in CSS
    this.style.display = 'none';
});
>>>>>>> Stashed changes
