// This script is client side, it sets up google maps and allows the user to pick a location and search the map.
// Geolocation is used to auto find the users location, however this doesnt work in chrome/firefox without https
// (However, it should still work if the server is just localhost)

var map;
var marker = false;

function initMap() {
    // Setup map
    var center = new google.maps.LatLng(27.46, 153.02); // Approx brisbane city?
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 12
    });

    // Geolocation. This does not work in chrome since not https. Works in edge.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(pos);
        }, function() {
            console.log("Error getting users location");
        });
    } else {
        console.log("Browser doesn't support geolocation");
    }

    // Search box
    var input = document.getElementById('psinput');
    var searchBox = new google.maps.places.Autocomplete(input);
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    var markers;
    // Prediction selected
    searchBox.addListener('place_changed', function() {
        var place = searchBox.getPlace();
        map.setCenter(place.geometry.location);
    });

    // Map click listener
    google.maps.event.addListener(map, 'click', function(event) {
        var clickedLocation = event.latLng;
        if (marker === false) {
            marker = new google.maps.Marker({
                position: clickedLocation,
                map: map,
                draggable: true
            });
            google.maps.event.addListener(marker, 'dragend', function(event) {
                updateMarkerLocation();
            });
        } else {
            marker.setPosition(clickedLocation);
        }
        updateMarkerLocation();
    });
}

// Inserts the lat and lon into the form, called when the marker is moved
function updateMarkerLocation() {
    var currentLocation = marker.getPosition();
    $("#map-search-form input[name=lat]").val(currentLocation.lat());
    $("#map-search-form input[name=lon]").val(currentLocation.lng());
}

// jquery is pretty cool i guess
// Get the form details and submit them. Yes I could have done this as an actual form using GET params and stuff, but I did it like this anyway. Youre not my dad.
$('#map-search-form').on('submit', function() {
    var lat = $("#map-search-form input[name=lat]").val();
    var lon = $("#map-search-form input[name=lon]").val();
    var cuisine = $("#map-search-form input[name=cuisine]").val();
    console.log("Cuisine [" + cuisine + "]");
    if (cuisine == "") cuisine = "None";
    window.location.href = `/result/${lat}/${lon}/${cuisine}`;
    return false;
});

google.maps.event.addDomListener(window, 'load', initMap);