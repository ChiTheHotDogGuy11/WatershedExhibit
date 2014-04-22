var map;

function centerMap() {
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(47.971537, -131.132813),
        new google.maps.LatLng(24.754314, -76.728516));
    map.fitBounds(defaultBounds);
}

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
      var dist = 60;
      var box = new google.maps.LatLngBounds(
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),225,dist),
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),45,dist));
      
      $('#preference-loading').html('<h4>Loading Area</h4><img src="/images/loading.gif"/>');
      Preferences.latLng = {lat: kmlEvt.latLng.lat(), lng: kmlEvt.latLng.lng()};
      
      //Get Station Info
      //NOAA.stations_for_area(box,function(data) {
      //  NOAA.data_for_stations(data, {startdate: "2013-03-01", enddate: "2013-03-31", datasetid: "GHCNDMS"}, function(data) {
      //    console.log(data);
      //  });
      //});
      
      //Solar potential for area
      //NREL.get_solar(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),100,function(data) {console.log(data)});
      //Get the geothermal info
      ////NREL.get_geothermal(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),"natural_gas",2000,function(data){ console.log(data)});  
    });
  });
  
  //Update our weather and rates when we get a new LatLng
  Preferences.bind("latLng", function() {
    $('#preferences-form :submit').prop('disabled', false);
    var count = 0;
    
    function doneLoading(count) {
      if (count >= 4) {
        $('#preference-loading').html('<h4>Area Selection</h4><p><strong>Zip</strong>'+Preferences.zip+'</p>');
        $('#preferences-form :submit').prop('disabled', false);
        count = 0;
      }
    }

    //Update the rates
    NREL.get_rates(Preferences.latLng.lat, Preferences.latLng.lng, function(data) { Preferences.rates = data.outputs; doneLoading(++count); });
    //Update weather
    Weather.set_location(Preferences.latLng, function(data) { Preferences.weather = data; doneLoading(++count); });
    //Update zip code
    geocode.find_zip(Preferences.latLng, function(data) { Preferences.zip = data; doneLoading(++count); });
    //get soil information 
    soil.get_preference_info(Preferences.latLng, function(data) { Preferences.soil = data; doneLoading(++count); });
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

//This NOAA Stuff is Great -- but their data is too unreliable to use
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
  data_for_stations: function(stations,params, callback) {
    var station = "stationid=" + stations[0].id;
    for (var i = 1; i < stations.length; i++)
    {
      station += "&stationid=" + stations[i].id;
    }
    this.request("data?"+station, params, callback);
  },
  data_for_stations_grouped: function(item,params,stations,callback) {
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
  },
  get_preference_info: function(latLon, callback) {
    this.get_data(latLon.lat, latLon.lng, function(data) {
      var ret = {};
      $('#loaderdiv').empty();
      $('#loaderdiv').append($(data));
      ret["flood"] = $('#loaderdiv').find('.mudata span:contains("Flood")').next().html().trim();
      ret["storage"] = $('#loaderdiv').find('.mudata span:contains("Storage")').next().html().trim();
      ret["drainage_wet"] = $('#loaderdiv').find('.mudata span:contains("Wettest Component")').next().html().trim();
      //NOTE lower drainage = higher runoff
      ret["drainage_dom"] = $('#loaderdiv').find('.mudata span:contains("Dominant")').next().html().trim();
      ret["wetland"] = $('#loaderdiv').find('.mudata span:contains("Hydric")').next().html().trim();
      ret["table"] = $('#loaderdiv').find('.mudata span:contains("April-June")').next().html().trim();
      ret["soil"] = $('#loaderdiv').find('.muname > .mu-name').html().trim();
      callback(ret);
    });
  }
}

//@see http://www.hamweather.com/support/documentation/aeris/
var Weather = {
  
  client_id: "nMCnfGEEaArwNARvEdiZb",
  client_secret: "i8by9MQMwt1p4MPrRoLmnHhYhu030KkqcX1g5vo8",
  normals: null,
  get_data: function(action,loc,params,callback) {
    params["client_id"] = this.client_id;
    params["client_secret"] = this.client_secret;
    $.ajax({
        url: "http://api.aerisapi.com/"+action+"/"+loc,
        data: params,
        success: callback,
        error: function(jqXHR, textStatus, ex) {
          console.log(textStatus);
        }
    });
  },
  get_normals: function(loc,callback) {
    params = {};
    params["p"] = loc.lat.toFixed(3) + "," + loc.lng.toFixed(3);
    params["limit"] = 5;
    params["pfilter"] = "monthly";
    params["from"] = "1/1/2010";
    params["to"] = "12/31/2010";
    this.get_data("normals", "closest", params, callback);
  },
  set_location: function(loc,callback){
    this.get_normals(loc, function(data) {
      var compressed_data = new Array();
      //month loop
      for(var j = 0; j < data.response[0].periods.length; j++) {
        //object loop
        var month_obj = {};
        for(var i = 0; i < data.response.length; i++)
        {
          var period = data.response[i].periods[j];
          for (var prop in period) {
            if (period.hasOwnProperty(prop)) {
              if (month_obj[prop] == null) {
                month_obj[prop] = period[prop];
              }
            }
          }
          if (month_obj.cdd < 0 || month_obj.hdd < 0) {
            month_obj.cdd = null;
            month_obj.hdd = null;
          }
        }
        compressed_data.push(month_obj);
      }
      normals = compressed_data;
      callback(compressed_data); 
    });
  }
}

/*Lists our preferences that we will set at the beginning / throughout the simulation
 *
 * We specify a new preferences we want -- do so in standard object notation ex: 
 *  zip: default_value,
 *
 * To get a value or set one, just do so as a we would normally for an object ex:
 *  Preferences.zip / Preferences.zip = 
 *
 * Finally, we can bind methods that will run when a certain preference(s) is updated, ex:
 *  Preferences.bind("zip","latLng", function() { })
 */
var Preferences = {
  latLng: {lat: -79.98493194580078, lng: 40.44328916582578},
  zip: 15219,
  solar_size: 10,
  sqft: 2000,
  fuel: "natural_gas",
  efficient_fixtures: false,
  num_people: 4,
  weather: null,
  rates: null,
  //Use like bind("latLng","solar_size" function() { stuff })
  bind: function() {
    for(var i = 0; i < arguments.length-1; i++)
    {
      this["bind_"+arguments[i]](arguments[arguments.length-1]);
    }
  },
  //This method is pure evil meta programming -- shield your eyes
  init: function() {
    for(var prop in this){
      if (this.hasOwnProperty(prop) && prop != "init" && prop != "bind"){
        var update_functions = new Array();
        var self = this;
        //Fancy stuff to maintain our closure in the for loop
        this["bind_"+prop] = (function(prop,arr){
          return function(func) {
            arr.push(func);
          }
        })(prop,update_functions);
        var tmp_val = self[prop];
        //More fancy for loop closure stuff
        //Also, overwriting our default variables, hiding them, and then 
        //virtually creating a binding array
        this.__defineSetter__(prop,(function(prop,arr){
          return function(val) {
            self[prop+"_val"] = val;
            for(var k = 0; k < arr.length; k++){
              arr[k]();
            }
          }
        })(prop,update_functions));
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

var Building = {
  default_params: {
    showers: 1, //Showers per day per person
    shower_time: 6.3,
    shower_flow: 3.8, //3.8 is standard -- 1.6 is for efficient faucets
    baths: 2, //Baths per week
    toilet_flushes: 2, //# of toilet flushes in a day per person
    gpf: 5, //Gallons per flush (5 std, 1.6 efficiency
    faucet: 5, //# of times a person uses the faucet daily
    faucet_min: .5, //length of faucet used
    hand_dishes: 1, //# of times the dishes are washed by hand per day
    hand_min: 5, //# of minutes for washing dishes by hand
    dishwasher_loads: 7, //# of dishwasher loads per week
    dishwasher_flow: 15, //Gallons per diswasher load
    laundry: 7, //Loads of laundry per week
    laundry_flow: 55, //Gallons for each load
  }, 
  indoor_water_usage: function(params) {
    params = params || {}
    var params = $.extend({},this.default_params,params)
    var bathtotal = Math.round((params.showers * params.shower_time * params.shower_flow * Preferences.num_people) + (params.baths / 7 * 40));
    var toiletday = Math.round(Preferences.num_people * params.gpf * params.toilet_flushes);
    var faucetday = Math.round(params.faucet * Preferences.num_people * params.faucet_min * 3);
    var dishwasherday = Math.round((params.dishwasher_loads * params.dishwasher_flow)/7);
    var laundryday = Math.round((params.laundry * params.laundry_flow)/7);
    var dishday = Math.round(params.hand_dishes * params.hand_min * 3);
    var indoorday = Math.round(bathtotal + toiletday + faucetday + laundryday + dishwasherday + dishday);
    return Math.round(indoorday * 30.4);
  },
  
  outdoor_water_usage: function(month) {
    //Calculate this based on rainfall for the month
    if (Preferences.weather == null) { return 0 }
    //Not going to use any water if it is cold on average outside
    if (Preferences.weather.temp.avgF > 50) {
      //We water our garden for 2 hours every day
      return 18000;
    } else {
      return 0;
    }
  },
  //Usage in kWh -- could be effected with energy efficient appliances
  //@see http://www.cpi.coop/my-account/online-usage-calculator/
  electricity_usage: function() {
    var total = 0;
    total += 57; //Refrigerator
    total += 58; //Freezer
    total += 13; //Dishwasher
    total += 24; //Range/Oven
    total += 11; //Microwave
    total += 10; //Coffee Machine
    total += 135; //Well Pump
    total += 25; //55" TV
    total += 21 * Math.floor(Preferences.num_people / 2); /* Computer */ 
    total += 1 * Preferences.num_people; //Cell Phones
    total += 23; //DVR
    total += (Preferences.num_people > 2)? 15:0; //Video game system
    total += 6; //Washing Machine
    total += 57; //Clothes dryer
    total  += 405; //Water heater
    return total
  },

}

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
        electricrate: Preferences.rates.residential,
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
        Preferences.rates.natural_gas = csv[13][0];
        Preferences.rates.propane = csv[13][3];
        Preferences.rates.oil = csv[13][2];
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
