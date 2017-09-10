var geocoder;
var map;
var latLng;
var infoWindow;
var markers = [];

//called when page opens to initialize map and prompt use via infoWindow
function initMap() {
  geocoder = new google.maps.Geocoder();
  latLng = new google.maps.LatLng(33.8222611, -111.918203);
  map = new google.maps.Map(document.getElementById('current-location-map'), {
    center: latLng,
    zoom: 13
  });

  var contentString = "<div>" +
    "<h4>Set your location above to get started!</h4>" +
    "<p>Either click 'Use My Current Location' to be found automatically<br>" +
    "or type in your address and click Find Me<p>" +
    "</div>";

  setInfoWindow(contentString);
}

function setInfoWindow(contentString) {

  if (contentString === "foundLocationInstructions") {
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
  });

  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });
}

//current options for search distance, must be converted to kilometers
var radiusOptions = [
  { miles: 3 },
  { miles: 5 },
  { miles: 7 },
  { miles: 10 },
  { miles: 15 },
  { miles: 20 }
]

var viewModel = function() {
  var self = this;

  this.radiusOptions = ko.observableArray(radiusOptions);

  //Use the browser's geolocation to find device's lat and lon, then set map
  this.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

        //store latitude longitude positions
        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //set user location and infowindow
        map.setCenter(latLng);
        setInfoWindow("foundLocationInstructions");
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
        map.setCenter(latLng);
        setInfoWindow("foundLocationInstructions");
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  this.findPizza = function() {
    var radius = $("#radius").val();
    $("#input-radius").hide();
  }

}

ko.applyBindings(new viewModel());
