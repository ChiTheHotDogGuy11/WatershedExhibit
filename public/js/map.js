var map;

function initialize() {

  var markers = [];
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

//  var weatherLayer = new google.maps.weather.WeatherLayer({
//    temperatureUnits: google.maps.weather.TemperatureUnit.FAHRENHEIT
//  });
//  weatherLayer.setMap(map);

  var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(47.971537, -131.132813),
      new google.maps.LatLng(24.754314, -76.728516));
  map.fitBounds(defaultBounds);

  var kmzLayer = new google.maps.KmlLayer({
    url: 'https://raw.githubusercontent.com/ChiTheHotDogGuy11/WatershedExhibit/master/public/all-climate-zones.kml',
    preserveViewport: true,
    map: map,
    suppressInfoWindows: true
  });

  var curWindow = null;

  google.maps.event.addListener(kmzLayer, 'click', function(kmlEvt) {
    //TODO Something more here -- get the location
    
    var content = "<h2>"+kmlEvt.featureData.name+"</h2>\n"+kmlEvt.featureData.description;
    content += "<button class='info_button'>Choose Location</button>";

    if (curWindow != null) {
      curWindow.close();
    }
    curWindow = new google.maps.InfoWindow({
      content: content,
    });

    curWindow.open(map);
    curWindow.setPosition(kmlEvt.latLng);

    $('.info_button').click(function (event) {
      var dist = 30;
      var box = new google.maps.LatLngBounds(
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),225,dist),
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),45,dist));
      
      //Get Station Info
      NOAA.request("stations",{extent: box.toUrlValue()},function(data) {console.log(data)});
    
      //Get Electricity Rates
      rates.get_data(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),function(data) {console.log(data)});
    });
  });


  // Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  $('#apply').click(function() {
    center = map.getCenter();
  });

  var searchBox = new google.maps.places.SearchBox((input), {bounds: defaultBounds});

  // [START region_getplaces]
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }

    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }
    if (places.length == 1) {
       map.setCenter(places[0].geometry.location);
       map.setZoom(12);
    } else {
      map.fitBounds(bounds);
    }
  });
  // [END region_getplaces]

  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
      return this.slice(0, str.length) == str;
    };
}

var NOAA = {

  key: "GQEfnmROmOrqmgxclKAELCzpALViYCrw",
  request: function(item, params, retFunc) {
    var mergeData = $.extend({},{limit: "1000", datasetid: "ANNUAL"},params);
    $.ajax({
      url: "http://www.ncdc.noaa.gov/cdo-web/api/v2/"+item,
      headers: {token: this.key},
      data: mergeData
    }).done(function(data){
      var offset = data.metadata.resultset.offset;
      if (data.results.length >= mergeData.limit)
      {
        var reqData = $.extend({},mergeData,{offset: offset + 1000});
        var prevData = data;
        NOAA.request(item,reqData,function(data){
           retFunc(prevData.results.concat(data));
        });
      } else {
        retFunc(data.results);
      }
    });
  },
  lookup_city: function(city, callback) {
    var cities = this.request("locations",{locationcategoryid: "CITY"},function(data){
      callback($.grep(data, function(e){return e.name.startsWith(city)}));      
    });
  },
  lookup_cnty: function(cnty,callback) {
    var cities = this.request("locations",{locationcategoryid: "CNTY"},function(data){
      callback($.grep(data, function(e){return e.name.startsWith(cnty)}));      
    });
  },
  normal_annual: function(location) {
    this.request("data",{datasetid: "NORMAL_ANN", startdate: "2010-01-01", enddate: "2010-01-01", locationid: location}, function (data){
      console.log(data);
    });
  }
}

var soil = {
  
  get_data: function(lat,lon,callback) {
    $.ajax({
      url: window.location.protocol + "/api/" + encodeURIComponent("http://casoilresource.lawr.ucdavis.edu/gmap/get_mapunit_data.php?lat="+lat+"&lon="+lon),
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus,ex) {
        console.log(textStatus);
      }
    });
  }
}

var rates = {

  get_data: function(lat,lon,callback) {
    $.ajax({
      url: 'http://developer.nrel.gov/api/utility_rates/v3.json',
      data: {api_key: 'uqFVoJMelgQIZZfEhM5tSGKlSkWMFu6TN78nKGjX', lat: lat, lon: lon},
      success: function(data) {
        callback(data);
      },
    });
  }

}

var geothermal = { 
  
  get_data: function(zip,fuel,square_feet,callback) {
    $.ajax({
      url: 'http://anroth.yourvirtualhvac.com/consumer/house/',
      beforeSend: function(xhr, settings) {
        settings.url = window.location.protocol + "/api/" + encodeURIComponent(options.url);
        options.crossDomain = false;
      },
      data: {
        house_age: 15,
        zipcode: zip,
        square_foot: square_feet,
        house_fuel: fuel,
        fuel: fuel
      }
    });
  }

}

//Allow us to pass cross domain ajax requests through our node proxy
$(function(){
  /*
  $.ajaxPrefilter(function(options) {
    if (options.crossDomain) {
      options.url = window.location.protocol + "/api/" + encodeURIComponent(options.url);
      options.crossDomain = false;
    }
  });
  */
  google.maps.event.addDomListener(window, 'load', initialize);

  //Setup our datasliders to output their values when they are changed
  $("[data-slider]").bind("slider:ready slider:changed", function(event,data) {
    $(this)
      .nextAll(".output:first")
        .html(data.value);
  });
});

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

if (typeof(Number.prototype.toDeg) === "undefined") {
  Number.prototype.toDeg = function() {
    return this * 180 / Math.PI;
  }
}

var destinationFrom = function(lat,lng,brng, dist) {
    this._radius = 6371;
    dist = typeof(dist) == 'number' ? dist : typeof(dist) == 'string'
           && dist.trim() != '' ? +dist : NaN;
    dist = dist / this._radius;
    brng = brng.toRad();  
    var lat1 = lat.toRad(),
        lon1 = lng.toRad();
    var lat2 = Math.asin(Math.sin(lat1) * Math.cos(dist) +
        Math.cos(lat1) * Math.sin(dist) *
        Math.cos(brng));
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dist) *
        Math.cos(lat1), Math.cos(dist) -
        Math.sin(lat1) * Math.sin(lat2));
    lon2 = (lon2 + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    return new google.maps.LatLng(lat2.toDeg(),lon2.toDeg());
}


function getMapCenter() {
  obj = map.getCenter();
  return {lat: obj.lat(), lon: obj.lng()}
}
