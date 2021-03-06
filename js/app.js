var geocoder;
var map;
var latLng;
var infoWindow;
var markers = [];
var homeIcon = 'static/homeIcon.png';
var pizzaIcon = 'static/pizzaIcon.png';

var METERS_TO_MILES = 1609.34;
var FOURSQUARE_CLIENTID = "4YYYXARVHBCLER0HYWTICLQYO3X43JNFZFZMYIHZA2NKDOSH";
var FOURSQUARE_CLIENTSECRET = "TMYXTG1MOMONBZHIIHZYWQX2NVBZCQT0BTP5EDXDHAAU0W03";

// var ZOOM_OUT = 0; //represents fully zoomed out map, i.e. globe
var ZOOM_IN = 15; //represents zoomed in to less than a mile view
var BOUNCE_DURATION = 3530; //time in ms, each bounce 700ms, -> 5 bounces +30ms


//called when page opens to initialize map and prompt use via infoWindow
function initMap() {
  geocoder = new google.maps.Geocoder();
  latLng = new google.maps.LatLng(32.9290326, -96.8253039);
  infoWindow = new google.maps.InfoWindow();
  map = new google.maps.Map(document.getElementById('current-location-map'), {
    center: latLng,
    zoom: ZOOM_IN
  });

  var contentString = "<div>" +
    "<h4>Set your location above to get started!</h4>" +
    "<p>Either click 'Use My Current Location' to be found automatically<br>" +
    "or type in your address and click Find Me<p>" +
    "</div>";

  makeMarker(infoWindow, contentString, google.maps.Animation.BOUNCE);

  //disabled to avoid misleading user. Currently the autofill feature will not
  //work with Knockout https://github.com/knockout/knockout/issues/648
  // var addressAutocomplete = new google.maps.places.Autocomplete(
  //   document.getElementById("address")
  // );

  initViewModel();
}

//update map with current lat lon position and zoom in
function setLocation() {
  map.setCenter(latLng);
}

//zoomNumber 0 - 18 -> zoomed out to zoomed in
function setZoom(radius) {
  switch (radius) {
    case "1":
      map.setZoom(15);
      break;
    case "2":
      map.setZoom(13);
      break;
    case "3":
      map.setZoom(12);
      break;
    case "5":
      map.setZoom(12);
      break;
    case "10":
      map.setZoom(11);
      break;
    case "20":
      map.setZoom(9);
  }
}

//uses info window and animate style to create and return google marker
//accepts optional icon for custom marker icon
function makeMarker(infoWindow, contentString, animate, icon) {

  var marker = new google.maps.Marker({
      position: latLng,
      map: map,
      animation: animate
  });

  if (icon) {
    marker.setIcon(icon);
  }

  marker.addListener('click', function() {
    marker.setAnimation(null);
    // map.panTo(marker.getPosition());
    populateInfoWindow(this, infoWindow, contentString);
  });
  setTimeout(function() { marker.setAnimation(null); }, BOUNCE_DURATION);

  return marker;
}

//restrict map to use only one infoWindow for cleaner interface
function populateInfoWindow(marker, infoWindow, contentString) {
  // Check to make sure the infoWindow is not already opened on this marker.
  if (infoWindow.marker != marker) {
    infoWindow.marker = marker;
    infoWindow.open(map, marker);
    infoWindow.setContent(contentString);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() { marker.setAnimation(null); }, BOUNCE_DURATION);
    // Make sure the marker property is cleared if the infoWindow is closed.
    infoWindow.addListener('closeclick',function(){
    infoWindow.setMarker = null;
    });
  }
}

//delete all markers from map and clear array
function deleteMarkersArray() {
  for (var i=0; i<markers.length; i++) {
    markers[i].marker.setMap(null);
  }
  markers = [];
}

//current options for search distance, must be converted to meters
var radiusOptions = [
  { miles: 1 },
  { miles: 2 },
  { miles: 3 },
  { miles: 5 },
  { miles: 10 },
  { miles: 20 }
];

//object used to create pizza locations
var PizzaLocation = function(id, name, latLng, distance, url, visible) {
  this.id = id;
  this.name = ko.observable(name);
  this.latLng = latLng;
  this.distance = distance;
  this.url = url;
  this.isVisible = ko.observable(visible);
};

//view model for knockout JS
var ViewModel = function() {
  var self = this;

  this.radiusOptions = ko.observableArray(radiusOptions);
  this.selectedRadius = ko.observable();
  this.address = ko.observable();
  this.filterKeyword = ko.observable();
  this.pizzaLocations = ko.observableArray();

  //Use the browser's geolocation to find device's lat and lon, then set map
  this.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {

        //store latitude longitude positions
        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        //set user location and marker
        setLocation();
        map.setZoom(ZOOM_IN);

        var contentString = "<div>" +
          "<h4>We found you! Hola!!</h4>" +
          "<p>Now let's find you some pizza!!<br>" +
          "Set the search radius to the left, then click 'Find Pizza!'<p>" +
          "</div>";

        makeMarker(infoWindow, contentString, google.maps.Animation.BOUNCE, homeIcon);
      });

    } else {
      // Browser doesn't support Geolocation
      alert("Sorry, your browser does not support Geolocation. " +
        "Please enter your address and click Find Me to get started.");
    }
  };

  //Use input from user to set map location and map
  this.geocodeLocation = function() {
    //to meet project requirements, JQuery is not being used. However, there is
    //an issue with most browsers and Knockout in regards to autofill. Here
    //is the link with discussion: https://github.com/knockout/knockout/issues/648
    // var address = $("#address").val();
    var address = self.address();
    geocoder.geocode( { 'address': address }, function(results, status) {
      if (status == 'OK') {
        //store latitude longitude positions
        latLng = results[0].geometry.location;

        //set user location and marker
        setLocation();
        map.setZoom(ZOOM_IN);

        var contentString = "<div>" +
          "<h4>There you are! Hi!!</h4>" +
          "<p>Now let's find you some pizza!!<br>" +
          "Set the search radius to the left, then click 'Find Pizza!'<p>" +
          "</div>";

        makeMarker(infoWindow, contentString, google.maps.Animation.BOUNCE, homeIcon);
      } else {
        alert("Dang, we couldn't find you because " + status);
      }
    });
  };

  //search for pizza places in search radius
  this.findPizza = function() {
    //get search radius in miles and convert to Meters
    var radius = self.selectedRadius() * METERS_TO_MILES;
    setZoom(self.selectedRadius());

    //clear array of found locations
    self.pizzaLocations.removeAll();
    deleteMarkersArray();

    var searchUrl = "https://api.foursquare.com/v2/venues/search?" +
      "ll=" + latLng.lat() + "," + latLng.lng() +
      "&radius=" + radius +
      "&intent=" + 'browse' +
      "&query=" + 'pizza' +
      "&client_id=" + FOURSQUARE_CLIENTID +
      "&client_secret=" + FOURSQUARE_CLIENTSECRET +
      "&v=20170911";

    $.get(searchUrl, function(data) {
      var results = data.response.venues;
      for (var i=0; i< results.length; i++) {
        var id = results[i].id;
        var name = results[i].name;
        var lat = results[i].location.lat;
        var lng = results[i].location.lng;
        var distance = (results[i].location.distance / METERS_TO_MILES).toFixed(2);
        var url = results[i].url;
        var isVisible = true;

        latLng = new google.maps.LatLng(lat, lng);

        //set the url string for infoWindow
        if (url === undefined) {
          url = "In this day and age, they still don't have a website ... ugh.";
        } else {
          url = "<a href=" + url + ">" + url + "</a>";
        }

        var contentString = "<div><h4>" + name + "</h4>" +
          "<p>" + distance + " miles away" + "<p>" +
          "<p>" + url + "</p></div>";

        //add the marker and push to array
        var marker = makeMarker(infoWindow, contentString, google.maps.Animation.DROP, pizzaIcon);
        markers.push({
          id: id,
          marker: marker,
          infoWindow: infoWindow,
          contentString: contentString
        });

        //add item to observableArray
        self.pizzaLocations.push(new PizzaLocation(id, name, latLng, distance, url, isVisible));
      }
    })
    //catch error in response and notify user
    .fail(function() {
      alert("Sorry, we couldn't find you pizza! FourSquare is experiencing issues. Please try again later. " +
        "If the problem persists, ask your System Administrator if they are blocking FourSquare.");
    });
  };

  //open marker infoWindow when list item clicked
  this.openMarker = function(data) {
    for (var i=0; i<markers.length; i++) {
      var marker = markers[i];
      if (marker.id == data.id) {
        populateInfoWindow(marker.marker, marker.infoWindow, marker.contentString);
      }
    }
  };

  //use text filter for found pizza places
  this.filterPizza = function() {
    if (markers === 0) {
      alert("Dude, you gotta find some pizza places first! Hit Find Pizza and then try me again.");
      return;
    }

    var filterText = self.filterKeyword().toUpperCase();

    for (var i=0; i<self.pizzaLocations().length; i++) {
      var location = self.pizzaLocations()[i];
      if (location.name().toUpperCase().indexOf(filterText) > -1) {
        location.isVisible(true);
        markers[i].marker.setVisible(true);
      }
      else {
        location.isVisible(false);
        markers[i].marker.setVisible(false);
      }
    }
  };

};

//initialize new view model and call function to find nearby pizza places
function initViewModel() {
  var vm = new ViewModel();
  ko.applyBindings(vm);
  vm.findPizza();
}

//catch all other errors
function windowError() {
  alert("Uh oh! Random error!" +
    "Check with your system admin to see if they are blocking FourSquare or Google Maps.");
}
