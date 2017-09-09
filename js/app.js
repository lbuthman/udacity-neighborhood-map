var map;
var markers = [];

var embed = "https://www.google.com/maps/embed/v1/place?key=AIzaSyBygxnA7fNhpEsVlPfPrHmkNgyWRo00LS4&q=world";

function initMap() {

}

var embeddedMap = {
  defaultMap: "static/default-map.jpg",
  src: ""
}

var viewModel = function() {
  var self = this;

  // this.location = ko.oberservable(embeddedMap);

  this.setLocation = function() {
    alert('hi');
  }
}

ko.applyBindings(new viewModel());
