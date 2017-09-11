var geocoder;
var map;
var latLng;
var infoWindow;
var markers = [];
var METERS_TO_MILES = 1609.34;

//called when page opens to initialize map and prompt use via infoWindow
function initMap() {
  geocoder = new google.maps.Geocoder();
  latLng = new google.maps.LatLng(33.8222611, -111.918203);
  map = new google.maps.Map(document.getElementById('current-location-map'), {
    center: latLng,
    zoom: 0
  });

  var contentString = "<div>" +
    "<h4>Set your location above to get started!</h4>" +
    "<p>Either click 'Use My Current Location' to be found automatically<br>" +
    "or type in your address and click Find Me<p>" +
    "</div>";

  setInfoWindow(contentString, google.maps.Animation.BOUNCE);

  var addressAutocomplete = new google.maps.places.Autocomplete(
    document.getElementById("address")
  );
}

//update map with current lat lon position and zoom in
function setLocation() {
  map.setCenter(latLng);
}

//zoomNumber 0 - 18 -> zoomed out to zoomed in
function setZoom(zoomNumber) {
  map.setZoom(zoomNumber);
}

function setInfoWindow(contentString, animate) {

  if (contentString === "findPizzaInstructions") {
    contentString = "<div>" +
      "<h4>There you are! Hi!!</h4>" +
      "<p>Now let's find you some pizza!!<br>" +
      "Set the search radius to the left, then click 'Find Pizza!'<p>" +
      "</div>";
  }

  var infoWindow = new google.maps.InfoWindow({ content: contentString });

  var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      animation: animate
  });

  marker.addListener('click', function() {
    marker.setAnimation(null);
    infoWindow.open(map, marker);
  });
}

//current options for search distance, must be converted to meters
var radiusOptions = [
  { miles: 3 },
  { miles: 5 },
  { miles: 7 },
  { miles: 10 },
  { miles: 15 },
  { miles: 20 }
]

//object used to create pizza locations
var PizzaLocation = function(data) {
  this.location = ko.observable(data.geometry.location);
  this.name = ko.observable(data.name);
}

var viewModel = function() {
  var self = this;

  this.radiusOptions = ko.observableArray(radiusOptions);
  this.pizzaLocations = ko.observableArray();

  //Use the browser's geolocation to find device's lat and lon, then set map
  this.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

        //store latitude longitude positions
        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //set user location and infowindow
        setLocation();
        setZoom(16);
        setInfoWindow("findPizzaInstructions", google.maps.Animation.BOUNCE);
      });

    } else {
      // Browser doesn't support Geolocation
      alert("Sorry, your browser does not support Geolocation. " +
        "Please enter your address and click Find Me to get started.");
    }
  }

  //Use input from user to set map location and map
  this.geocodeLocation = function() {
    var address = $("#address").val();
    geocoder.geocode( { 'address': address }, function(results, status) {
      if (status == 'OK') {
        //store latitude longitude positions
        latLng = results[0].geometry.location

        //set user location and infowindow
        setLocation();
        setZoom(16);
        setInfoWindow("findPizzaInstructions", google.maps.Animation.BOUNCE);
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  //search for pizza places in search radius
  this.findPizza = function() {
    //get search radius in miles and convert to Meters
    var radius = $("#radius").val() * METERS_TO_MILES;

    //clear array of found locations if existing
    self.pizzaLocations.removeAll();

    //$("#input-radius").hide();

    //create a request at current location for pizza type
    var request = {
      location: latLng,
      radius: radius,
      query: 'pizza'
    };

    //create service and pass response to callback function
    placesService = new google.maps.places.PlacesService(map);
    placesService.textSearch(request, function(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i=0; i< results.length; i++) {

          self.pizzaLocations.push(new PizzaLocation(results[i]));
        }
      }
      else {
        alert("Sorry, we couldn't find you pizza! Google responded with " + status);
      }
    });
  }

}

ko.applyBindings(new viewModel());
