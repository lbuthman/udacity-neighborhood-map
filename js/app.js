var map;
var markers = [];

function initMap() {

  var styles = [
    {
      featureType: 'water',
      stylers: [
        { color: '#19a0d8' }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.stroke',
      stylers: [
        { color: '#fff' },
        { weight: 6 }
      ]
    },{
      featureType: 'administrative',
      elementType: 'labels.text.fill',
      stylers: [
        { color: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -40 }
      ]
    },{
      featureType: 'transit.station',
      stylers: [
        { weight: 9 },
        { hue: '#e85113' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'labels.icon',
      stylers: [
        { visibility: 'off' }
      ]
    },{
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [
        { color: '#efe9e4' },
        { lightness: -25 }
      ]
    }
  ];

  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.934641, lng: -96.849289},
    zoom: 13,
    styles: styles,
    mapTypeControl: false
  });

  var locations = [
    {title: "Apt. Home Base", location: {lat: 32.928616, lng: -96.825974}},
    {title: "Bay 34th Street", location: {lat: 32.97324, lng: -96.820502}},
    {title: "Carmine's Pizzeria", location: {lat: 32.939885, lng: -96.815144}}
  ];

  var largeInfoWindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  var defaultIcon = makeMarkerIcon('0091ff');
  var highlightedIcon = makeMarkerIcon('FFFF24');

  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21, 34));

      return markerImage
    }

    for (var i=0; i<locations.length; i++) {
      var position = locations[i].location;
      var title = locations[i].title;
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        icon: defaultIcon,
        animation: google.maps.Animation.DROP,
        id: i
      });

      markers.push(marker);

      bounds.extend(marker.position);

      marker.addListener('click', function(){
        populateInfoWindow(this, largeInfoWindow);
      });

      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });

      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }

    document.getElementById('zoom-to-area').addEventListener('click', function(){
      zoomToArea();
    });
  }

function populateInfoWindow(marker, infowindow) {
  if (infowindow.marker != marker) {
    infowindow.setContent('');
    infowindow.marker = marker;
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    var streetViewService = new google.maps.StreetViewService();
    var radius = 50;

    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        var nearStreetViewLocation = data.location.latLng;
        var heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation, marker.position);
        infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
        var panorama = new google.maps.StreetViewPanorama(
          document.getElementById('pano'), panoramaOptions);
      } else {
        infowindow.setContent('<div>' + marker.title + '</div>' +
        '<div>No Street View Found </div>');
      }
    }

    streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);

    infowindow.open(map, marker);
  }
}

function showPizzerias() {
  var bounds = new google.maps.LatLngBounds();
  for (var i=0; i<markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }

  map.fitBounds(bounds);
}

function hidePizzerias() {
  for (var i=0; i<markers.length; i++) {
    markers[i].setMap(null);
  }
}

function zoomToArea() {
  var geocoder = new google.maps.Geocoder();
  var address = document.getElementById('zoom-to-area-text').value;
  var city = document.getElementById('city').value;
  if (address == '') {
    alert('Please enter an address to get started!');
  }
  else {
    geocoder.geocode({
      address: address,
      componentRestrictions: {locality: city}
    }, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(15);
      }
      else {
        alert("Sorry, we couldn't find that location. Please try again");
      }
    });
  }
}
