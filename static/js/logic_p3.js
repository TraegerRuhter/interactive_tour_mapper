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
