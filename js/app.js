var geocoder;
var map;
var infoWindow;
var markers = [];

function initMap() {
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById('current-location-map'), {
    center: {lat: 36.3875207, lng: -97.8941282},
    zoom: 2
  });
}

var currentLocation = {
  lat: "",
  lon: ""
}

var radiusOptions = [
  { miles: 3 },
  { miles: 5 },
  { miles: 7 },
  { miles: 10 },
  { miles: 15 },
  { miles: 20 }
]

//uses currentLocation object data to compose src for Google Api Map
function setLocationMap() {


}

var viewModel = function() {
  var self = this;

  this.radiusOptions = ko.observableArray(radiusOptions);

  //Use the browser's geolocation to find device's lat and lon, then set map
  this.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

      currentLocation.lat = position.coords.latitude;
      currentLocation.lon = position.coords.longitude;
      setLocationMap();
      });

    } else {
      // Browser doesn't support Geolocation

    }
  }

  //Use input from user to set map location and map
  this.geocodeLocation = function() {
    var address = $("#address").val();
    geocoder.geocode( { 'address': address }, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
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
