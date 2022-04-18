var map;
var rowTotal = 6;
var initLatLng = {lat: 44.9727, lng: -93.2354};
var markersArray = [];
var directionsDisplay;
var imgLocation = {lat: 44.9727, lng: -93.2354};

function initMap() {

    getUserLocation();

    map = new google.maps.Map(document.getElementById('map'), {
        center: initLatLng,
        zoom: 16
    });

    

    // Add table values to map
    for (var rowNum=0; rowNum<rowTotal; rowNum++) {
        addMarkerAtAddress(getName(rowNum), getLocation(rowNum), getContactInfo(rowNum));
    }
    populateNamesDropdown();

    directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
    });

    var input = document.getElementById('customLocation');
    var autocomplete = new google.maps.places.Autocomplete(input);
}

function geocodeCoords(geocoder, resultsMap, address) {
    var latitude = 0;
    var longitude = 0;
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            imgLocation.lat = results[0].geometry.location.lat();
            imgLocation.lng = results[0].geometry.location.lng();
            setImageCoords();
        }
    });

    return (latitude, longitude);
}

// This function takes a geocode object, a map object, and an address, and 
// if successful in finding the address, it places a marker with a callback that shows an 
// info window when the marker is "clicked"
function geocodeAddress(geocoder, resultsMap, address, name=null, contactInfo=null, image=null) {

    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location,
                title: address,
                icon:'../img/goldy_glasses.png'
            });

            // Generate contentString based on arguments
            if (image == null) {
                if (name == null || contactInfo == null) {
                    var contentString = "<div style='padding: 10px;'>" +
                                            address +
                                        "</div>";

                } else {
                    var contentString = "<div style='padding: 10px;'>" +
                                            "<b>" + name + "</b>" +
                                            "<br/>" + contactInfo + "<br/>" +
                                            address +
                                        "</div>";
                }
                
            } else {
                var contentString = "<div style='float:left;'>" +
                                        "<img src='" + image + "' style='width:100px;'>" +
                                    "</div>" +
                                    "<div style='float:right; padding: 10px;'>" +
                                        "<b>" + name + "</b>" +
                                        "<br/>" + contactInfo + "<br/>" +
                                        address +
                                    "</div>";
            }
            

            infowindow2 = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(marker, 'click', createWindow(resultsMap,infowindow2, marker));

            markersArray.push(marker);

        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

// Function to return an anonymous function that will be called when the rmarker created in the 
// geocodeAddress function is clicked	
function createWindow(rmap, rinfowindow, rmarker) {
    return function() {
        rinfowindow.open(rmap, rmarker);
    }
}


// Caller function for geocodeAddress
function addMarkerAtAddress(name, location, contactInfo) {

    let shepherd = /shepherd/i;
    let keller = /keller/i;
    let morrill = /morrill/i;

    var image = null;
    if (shepherd.test(location)) {
        image = "../img/Shepherd.jpg";
    } else if (keller.test(location)) {
        image = "../img/keller.jpg";
    } else if (morrill.test(location)) {
        image = "../img/morrill.jpg";
    }

    var geocoder = new google.maps.Geocoder();
    geocodeAddress(geocoder, map, location, name, contactInfo, image);  
}

// Access table element values
function getName(rowNum) {
    let name = document.getElementsByTagName("td")[0 + 6*rowNum];
    return name.textContent;
}

function getLocation(rowNum) {
    let location = document.getElementsByTagName("td")[2 + 6*rowNum];
    return location.textContent;
}

function getContactInfo(rowNum) {
    let contactInfo = document.getElementsByTagName("td")[3 + 6*rowNum];
    return contactInfo.textContent;
}


// Find nearby places within radiusMeters
function findPlaces(category, radiusMeters=500, center=initLatLng) {
    removeMarkers()

    if (category == "other") {
        category = document.getElementById("other").value;
    }

    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location : center,
        radius : radiusMeters,
        type : [category]
    }, placesCallback);
}

// Function used to create markers for nearby places
function placesCallback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
        directionsDisplay.setMap(null);
        document.getElementById("routeDirections").hidden = true;
    }
}

// Create a marker at a given place
function createMarker(place) {
    var marker = new google.maps.Marker({
        map : map,
        position : place.geometry.location
    });

    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(place.name);
        infowindow.open(map, this);
    });

    markersArray.push(marker);
}

// Remove all markers before adding more markers
function removeMarkers() {
    for (var i = 0; i < markersArray.length; i++ ) {
        markersArray[i].setMap(null);
    }
    markersArray.length = 0;
}

// show/hide 'other' text field
function toggleOther() {
    if (document.getElementById("places").value == "other") {
        document.getElementById("other").hidden = false;
    } else {
        document.getElementById("other").value="Enter Other Places"
        document.getElementById("other").hidden = true;
    }
}


// Code from W3Schools
// Get users location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(setInitPosition);
    }
}

function setInitPosition(position) {
    initLatLng.lat = position.coords.latitude;
    initLatLng.lng = position.coords.longitude;
    setImageCoords()
}

function populateNamesDropdown() {
    var names = document.getElementById('names');
    for (var row=0; row<rowTotal; row++) {
        names.options[names.options.length] = new Option(getName(row), getName(row));
    }
}

function getLocationFromName(name) {
    var row=0;
    for (row; row<rowTotal; row++) {
        if (getName(row) == name) {
            return getLocation(row);
        }
    }
}

function createRoute() {
    removeMarkers()

    var orig;
    if (document.getElementById("customLocation").value == "Default (current location)" || document.getElementById("customLocation").value == "") {
        orig = initLatLng;
    } else {
        orig = document.getElementById("customLocation").value;
    }

    var dest = getLocationFromName(document.getElementById("names").value)

    var transportation = document.querySelector('input[name="transportation"]:checked').value;

    var service = new google.maps.DirectionsService();
    service.route(
    {
        origin: orig,
        destination: dest,
        travelMode: transportation
    }, directionsCallback);
}

function directionsCallback(response, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        directionsDisplay.setMap(map);
        directionsDisplay.setDirections(response);
        document.getElementById("routeDirections").innerHTML = "<h1 class='goldHeader'>Route Directions</h1>";
        for (var i=0; i<response.routes[0].legs[0].steps.length; i++) {
            document.getElementById("routeDirections").innerHTML += (i+1) + ". " + response.routes[0].legs[0].steps[i].instructions + "<br>";
        }
        document.getElementById("routeDirections").hidden = false;
    }
}

function chgImg(name, txt, id) {
    var bigImage = document.getElementById(id);
    bigImage.src = name;
    bigImage.alt = txt;

    txt += ", MN";
    // Update distance calculator
    var geocoder = new google.maps.Geocoder();
    geocodeCoords(geocoder, map, txt);
    
    
}

function hideImg(id) {
    var smallImage = document.getElementById(id);
    smallImage.style.visibility="hidden";
}

function showImg(id) {
    var smallImage = document.getElementById(id);
    smallImage.style.visibility="visible";
}

// Set image coords and calculate distance
function setImageCoords() {
    document.getElementById("calcLatLng").innerHTML = "Latitude: " + imgLocation.lat + ", Longitude: " + imgLocation.lng;
    
    // Code from https://www.movable-type.co.uk/scripts/latlong.html
    const R = 6371e3; // metres
    const φ1 = imgLocation.lat * Math.PI/180; // φ, λ in radians
    const φ2 = initLatLng.lat * Math.PI/180;
    const Δφ = (initLatLng.lat - imgLocation.lat) * Math.PI/180;
    const Δλ = (initLatLng.lng - imgLocation.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    
    document.getElementById("calcDist").innerHTML = "Distance (meters): " + d;

}