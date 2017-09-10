var map;
var infoWindow;
var markers = [];

function initMap() {

}

var currentLocation = {
  lat: "",
  lon: "",
  address: "",
  embeddedMapBase: "https://www.google.com/maps/embed/v1/place?key=AIzaSyBygxnA7fNhpEsVlPfPrHmkNgyWRo00LS4&q="
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
function setLocation() {

  //hide default picture to be replaced with real map
  $("#default-map").hide();

  //determine whether to use lat/lon or address
  if (currentLocation.lat != 0 && currentLocation.lon != 0) {
    //update src attribute with correct location
    $("#current-location").attr("src", currentLocation.embeddedMapBase +
      currentLocation.lat + "," + currentLocation.lon);
  }
  else {
    $("#current-location").attr("src", currentLocation.embeddedMapBase +
      currentLocation.address);
  }


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
      setLocation();
      });

    } else {
      // Browser doesn't support Geolocation

    }
  }

  //Use input from user to set map location and map
  this.setLocation = function() {
    currentLocation.address = $("#address").val();
    setLocation();
  }


}

ko.applyBindings(new viewModel());
