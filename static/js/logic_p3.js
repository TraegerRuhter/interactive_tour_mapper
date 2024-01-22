var myMap;
var markers = [];
var polyline;


// pull data from the API
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

// Create a map and add a tile layer
function createMap() {
    // Remove the existing map instance if it exists
    if (myMap) {
        myMap.off();
        myMap.remove();
    }

    // Create a new map instance and center it on the USA
    myMap = L.map('map').setView([39.8283, -98.5795], 4);

    // Add a tile layer to the map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors, © CARTO'
    }).addTo(myMap);
}

// Initialize the map when the page is loaded
document.addEventListener('DOMContentLoaded', function () {
    createMap();
});

// Search for an artist when the button is clicked
function searchArtist() {
    const artistInput = document.getElementById('artistInput');
    const newArtistName = artistInput.value.trim();
    const apiKey = "bdf2d4f5-f2b8-4dba-91bf-0c2c5d8fadf3";

    createMap(); // Initialize the map

    getArtistEvents(apiKey, newArtistName)
        .then(eventsJson => {
            if (eventsJson.length === 0) {
                showNoEventsMessage(); // Shows the message for 2 seconds
                hideTourDatesInfo(); // Hide the tour dates info div
            } else {
                updateTourDatesInfo(newArtistName); // Update and show the tour dates info div
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
            hideTourDatesInfo(); // Hide the tour dates info div
        });
}

// Search for an artist when the enter key is pressed
document.getElementById('artistInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchArtist();
    }
});

// update the tour dates info div with the artist name
function updateTourDatesInfo(newArtistName) {
    var tourDatesInfoDiv = document.getElementById('tourDatesInfo');
    var artistNameDisplay = document.getElementById('artistNameDisplay');
    artistNameDisplay.textContent = newArtistName;
    tourDatesInfoDiv.style.display = 'block';
}

// hide the tour dates info div
function hideTourDatesInfo() {
    var tourDatesInfoDiv = document.getElementById('tourDatesInfo');
    tourDatesInfoDiv.style.display = 'none';
}

// Add markers and a polyline to the map
function addMarkersAndPolyline(eventsJson) {
    return new Promise(resolve => {
        clearMapforSearch(); // Clear existing markers and lines
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


function clearMap() {
    if (myMap) {
        myMap.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                layer.remove();
            }
        });
    }

    // Clear the table
    const tableBody = document.getElementById('tourDatesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Reset the artist input field
    var artistInput = document.getElementById('artistInput');
    artistInput.value = '';

    // Hide the tourDatesInfo div
    var tourDatesInfoDiv = document.getElementById('tourDatesInfo');
    tourDatesInfoDiv.style.display = 'none';
}

// Clear the map and the table but not the artist div
function clearMapforSearch() {
    if (myMap) {
        myMap.eachLayer(layer => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                layer.remove();
            }
        });
    }

    // Clear the table
    const tableBody = document.getElementById('tourDatesTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';

    // Reset the artist input field
    var artistInput = document.getElementById('artistInput');
    artistInput.value = '';
}

// Show the no events message
function showNoEventsMessage() {
    clearMap(); // Clear the map and the table
    // Display the no events message
    var messageDiv = document.getElementById('noEventsMessage');
    messageDiv.style.display = 'block';
}
