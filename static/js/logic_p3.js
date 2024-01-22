var myMap;
var markers = [];

async function getArtistEvents(apiKey, artistName) {
    const apiUrl = `https://www.jambase.com/jb-api/v1/events?apikey=${apiKey}&artistName=${artistName}`;
    const response = await fetch(apiUrl);
    const json_data = await response.json();
    const events = Array.isArray(json_data.events) ? json_data.events : [json_data.events];

    // Filter events to match the exact artist name
    const filteredEvents = events.filter(event =>
        event.performer.some(performer => performer.name.toLowerCase() === artistName.toLowerCase())
    );

    return filteredEvents;
}

function createMap() {
    if (myMap) {
        myMap.off();
        myMap.remove();
    }

    // Coordinates for the center of Oregon
    var oregonCenter = [44.0, -120.5];
    myMap = L.map('map').setView(oregonCenter, 7);

    // add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO'
    }).addTo(myMap);
}

function addMarkersAndPolyline(eventsJson) {
    return new Promise(resolve => {
        clearMap(); // Clear existing markers and lines
        markers = []; // Reset markers array

        const tableBody = document.getElementById('tourDatesTable').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = ''; // Clear existing rows in the table

        for (const event of eventsJson) {
            const place = event.location;
            const latitude = place.geo.latitude;
            const longitude = place.geo.longitude;


            const city = event.location.address.addressLocality ? event.location.address.addressLocality : "Not Available";
            const state = event.location.address.addressRegion.alternateName ? event.location.address.addressRegion.alternateName : "Not Available";
            const country = event.location.address.addressCountry.alternateName ? event.location.address.addressCountry.alternateName : "Not Available";


            const marker = L.marker([latitude, longitude]);
            markers.push(marker);

            const name = event.performer[0].name;
            const performanceDate = event.performer[0]['x-performanceDate'];
            
            // Add a popup to the marker
            var popupContent = '<div style="font-size: 16px;">' + // Change font size as needed
                'Band: ' + name + '<br>' +
                'Venue: ' + place.name + '<br>' +
                'Date: ' + performanceDate +
                '</div>';
            marker.bindPopup(popupContent).addTo(myMap);



            // Add a new row to the table for each event
            let row = tableBody.insertRow();
            row.insertCell(0).innerText = performanceDate; // Date
            row.insertCell(1).innerText = place.name; // Venue
            row.insertCell(2).innerText = city; // City
            row.insertCell(3).innerText = state; // State
            row.insertCell(4).innerText = country; // Country
        }

        // Create a polyline connecting markers
        if (markers.length > 1) {
            const polyline = L.polyline(markers.map(marker => marker.getLatLng()), { color: 'blue' });
            polyline.addTo(myMap);
        }

        resolve(); // Resolve the promise after all markers and lines are added
    });
}

function searchArtist() {
    const artistInput = document.getElementById('artistInput');
    const newArtistName = artistInput.value.trim();
    const apiKey = "bdf2d4f5-f2b8-4dba-91bf-0c2c5d8fadf3";

    createMap(); // Initialize the map

    getArtistEvents(apiKey, newArtistName)
        .then(eventsJson => {
            if (eventsJson.length === 0) {
                showNoEventsMessage(); // This should show the message for 2 seconds
            } else {
                // Handle adding markers and polyline
                addMarkersAndPolyline(eventsJson).then(() => {
                    // Adjust the map view
                    if (markers.length > 0) {
                        var usaCenter = [39.8283, -98.5795];
                        myMap.setView(usaCenter, 4);
                    }
                });
            }
        })
        .catch(error => {
            console.error(error);
            showNoEventsMessage(); // Optionally show message on error as well
        });
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

function showNoEventsMessage() {
    var messageDiv = document.getElementById('noEventsMessage');
    messageDiv.style.display = 'block';
  }
  

// Initialize the map when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    createMap();
});
