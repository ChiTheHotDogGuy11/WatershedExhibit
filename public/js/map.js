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
      NOAA.stations_for_area(box,function(data) {
        NOAA.data_for_stations("datacategories", {}, data, function(data) {
          console.log(data.removeDups("id"));
        });
      });
    
      //Get Electricity Rates
      NREL.get_rates(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),function(data) {console.log(data)});
      //Solar potential for area
      NREL.get_solar(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),100,function(data) {console.log(data)});
      //Get the geothermal info
      NREL.get_geothermal(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),"natural_gas",2000,function(data){ console.log(data)});  
      
      //Get our zip code
      geocode.find_zip(kmlEvt.latLng, function(data) {
      });
    });
  });

  var geocode = {
    geocoder: new google.maps.Geocoder(),
    find_zip: function(latlng,callback) {
      this.geocoder.geocode({'latLng': latlng}, function(results,status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            var result = results[0];
            var zip = "";
            for(var i=0, len=result.address_components.length; i<len; i++) {
              var ac = result.address_components[i];
              if(ac.types.indexOf("postal_code") >= 0) zip = ac.long_name;
            }
            callback(zip);
          }
        }
      });
    } 
  }

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
      if(!data.hasOwnProperty("metadata")) { retFunc([]); }
      else {
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
  stations_for_area: function(latLng, callback) {
    this.request("stations", {extent: latLng.toUrlValue()}, function(data){
      callback(data);
    });
  },
  data_for_stations: function(item,params,stations,callback) {
    //For each stations, find what information we want
    var me = this;
    if (stations.length < 1) {
      callback([]);
    } else {
      this.request(item, $.extend({},params,{stationid: stations[0].id}), function(data) {
        var prevData = data;
        me.data_for_stations(item,params,stations.slice(1), function(data) {
          callback(prevData.concat(data)); 
        });
      });
    }
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

var Preferences = {
  latLng: {lat: -79.98493194580078, lng: 40.44328916582578},
  zip: 15219,
  solar_size: 10,
  //Use like bind("latLng","solar_size" function() { stuff })
  bind: function() {
    for(var i = 0; i < arguments.length-1; i++)
    {
      this["bind_"+arguments[i]](arguments[arguments.length-1]);
    }
  },
  init: function() {
    for(var prop in this){
      if (this.hasOwnProperty(prop) && prop != "init" && prop != "bind"){
        var update_functions = new Array();
        var self = this;
        this["bind_"+prop] = (function(prop){
          return function(func) {
            update_functions.push(func);
          }
        })(prop);
        var tmp_val = self[prop];
        this.__defineSetter__(prop,(function(prop){
          return function(val) {
            self[prop+"_val"] = val;
            for(var k = 0; k < update_functions.length; k++){
              update_functions[k]();
            }
          }
        })(prop));
        self[prop+"_val"] = tmp_val;
        this.__defineGetter__(prop,(function(prop){
          return function() {
            return self[prop+"_val"];
          }
        })(prop));
      }
    }
  },
}
Preferences.init();

var NREL = {
  api_key: 'uqFVoJMelgQIZZfEhM5tSGKlSkWMFu6TN78nKGjX',
  get_rates: function(lat,lon,callback) {
    $.ajax({
      url: 'http://developer.nrel.gov/api/utility_rates/v3.json',
      data: {api_key: this.api_key, lat: lat, lon: lon},
      success: callback, 
    });
  },
  /**
   * lat: latitude of site
   * lon: longitude of site
   * size: kW capacity of the system
   * @see http://developer.nrel.gov/docs/solar/pvwatts-v4/
   */
  get_solar: function(lat,lon,size,callback) {
    $.ajax({
      url: 'http://developer.nrel.gov/api/pvwatts/v4.json',
      data: {
        api_key: this.api_key,
        lat: lat,
        lon: lon,
        system_size: size,
      },
      success: callback,
    });
  },
  get_geothermal: function(lat,lon,fuel,square_feet,callback) {
    //Fuel Types: natural_gas, oil, propane, electricity
    //age: old, mid, new
    var self = this;
    $.ajax({
      url: 'http://www.waterfurnace.com/savings-calculator/v3.1.1/calculate.aspx',
      method: 'post',
      beforeSend: function(xhr, settings) {
        settings.url = window.location.protocol + "/api/" + encodeURIComponent(settings.url);
        settings.crossDomain = false;
      },
      data: {
        homeage: 10,
        sqft: square_feet,
        address: '',
        zipcode: '',
        fuelrate: '',
        electricrate: '',
        long: lon,
        lat: lat,
        state: '',
        fuelsource: 'gas',
        auxfuelsource: '',
        heatsetpoint: 70,
        coolsetpoint: 70,
        numresidents: 4,
      },
      success: function(data) {
        var csv = self.parse_csv(data);
        callback({
            heating_old: csv[1],
            cooling_old: csv[2],
            heating_new: csv[3],
            cooling_new: csv[4],
            hot_water_old: csv[5],
            hot_water_new: csv[6],
            heating_carbon_old: csv[7],
            cooling_carbon_old: csv[8],
            heating_carbon_new: csv[9],
            cooling_carbon_new: csv[10],
          }); 
      }
    });
  },
  parse_csv: function(data) {
    var textLines = data.split(/\r\n|\n/);
    var output = new Array();
    for (var i = 0; i < textLines.length; i++)
    {
      output.push(textLines[i].split(','));
    }
    return output;
  },
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


Array.prototype.removeDups = function (property){
  var arr = {};

  for ( var i=0; i < this.length; i++ )
      arr[this[i][property]] = this[i];

  var tmp = new Array();
  for ( key in arr )
      tmp.push(arr[key]);
  return tmp;
}

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
