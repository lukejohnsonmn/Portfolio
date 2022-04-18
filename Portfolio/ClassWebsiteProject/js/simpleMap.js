var map;
var initLatLng = {lat: 44.9727, lng: -93.2354};
var markersArray = [];

function initMap() {

    map = new google.maps.Map(document.getElementById('formMap'), {
        center: initLatLng,
        zoom: 16
    });

    var input = document.getElementById('location');
    var autocomplete = new google.maps.places.Autocomplete(input);

    // Code from user 'putvande' on Stack Overflow at: https://stackoverflow.com/questions/36892826/click-on-google-maps-api-and-get-the-address
    var geocoder = new google.maps.Geocoder();
    google.maps.event.addListener(map, 'click', function(event) {
        geocoder.geocode({'latLng': event.latLng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    document.getElementById('location').value = results[0].formatted_address;
                }
            }
        });
    });
}