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

  this.setLocation = function() {
    currentLocation.address = $("#address").val();
    setLocation();
  }
}

ko.applyBindings(new viewModel());
