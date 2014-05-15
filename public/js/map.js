//Google maps global object
var map;

/*
 * Centers our Google map to be around the US
 */
function centerMap() {
    var defaultBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(47.971537, -131.132813),
        new google.maps.LatLng(24.754314, -76.728516)
    );
    map.fitBounds(defaultBounds);
}

/*
 * Initialize our Google Map. Also sets up appropriate callbacks for preference selection
 */
function initialize() {

  var markers = [];
  //Use a Road Map 
  map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  //Set our default bounds to be the US. TODO this should limit selection to the US only
  var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(47.971537, -131.132813),
      new google.maps.LatLng(24.754314, -76.728516));
  map.fitBounds(defaultBounds);

  //Add our climate zones to our map using a KML layer. 
  var kmzLayer = new google.maps.KmlLayer({
    url: 'https://raw.githubusercontent.com/ChiTheHotDogGuy11/WatershedExhibit/master/public/all-climate-zones.kml',
    preserveViewport: true,
    map: map,
    suppressInfoWindows: true
  });
  //Variable to track if a popup window is open
  var curWindow = null;

  //Add a listener to the KmlLayer to deal with click events
  google.maps.event.addListener(kmzLayer, 'click', function(kmlEvt) {
    
    var content = kmlEvt.featureData.description;
    content += "<button class='info_button'>Choose Location</button>";

    //Close any existing open content bubbles
    if (curWindow != null) {
      curWindow.close();
    }
    //Set the content for the information bubble
    curWindow = new google.maps.InfoWindow({
      content: content,
    });

    curWindow.open(map);
    curWindow.setPosition(kmlEvt.latLng);

    //When the "Select" button is pressed, we want to perform a loading event that
    //sets the appropriate content
    $('.info_button').click(function (event) {
      curWindow.setContent('<h4>Loading Area</h4><img src="/images/loading.gif"/>');
      
      var dist = 60;
      var box = new google.maps.LatLngBounds(
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),225,dist),
          destinationFrom(kmlEvt.latLng.lat(),kmlEvt.latLng.lng(),45,dist));
      
      $('#preference-loading').html('<h4>Loading Area</h4><img src="/images/loading.gif"/>');
        
      //Set our climate and latLng that we retrieved from the map
      Preferences.latLng = {lat: kmlEvt.latLng.lat(), lng: kmlEvt.latLng.lng()};
      Preferences.climate = Building.setClimate(kmlEvt.featureData.name); 
      
    });
  });
  
  //Update our weather, rates, and soil info when we get a new LatLng
  Preferences.bind("latLng", function() {
    $('#preferences-form :submit').prop('disabled', true);
    var count = 0;
   
    //Our function to check when we are done loading external content 
    function doneLoading(count) {
      if (count >= 5) {
        if(curWindow != null) {
          curWindow.setContent('<h4>Loaded!</h4>');
        }
        
        //Set the location we have selected
        var html = '<h4>Area Selection</h4><p><strong>Zip</strong>&nbsp;&nbsp;'+Preferences.location.zip+'</p>';
        html += '<p><strong>City</strong>&nbsp;'+Preferences.location.city+'</p>';
        $('#preference-loading').html(html);
        $('#preferences-form :submit').prop('disabled', false);
        count = 0;
        $('#titlePanel').empty();
        $('#titlePanel').append('<h4>'+Preferences.location.city+'</h4>');
        $('#titlePanel').append('<h5>'+Preferences.climate + ' in ' + Preferences.location.state+'</h5>');
      }
    }

    //Update the rates
    NREL.get_rates(Preferences.latLng.lat, Preferences.latLng.lng, function(data) { Preferences.rates = data.outputs; doneLoading(++count); });
    //Update weather
    Weather.set_location(Preferences.latLng, function(data) { Preferences.weather = data; doneLoading(++count); });
    //Update zip code
    geocode.find_location(Preferences.latLng, function(data) { Preferences.location = data; doneLoading(++count); });
    //get soil information 
    soil.get_preference_info(Preferences.latLng, function(data) { Preferences.soil = data; doneLoading(++count); });
    //get rainfall events
    soil.get_rainfall_events(Preferences.latLng, function(data) { Preferences.rainfall_events = data; doneLoading(++count);});
  });

  /*
   * Geocoder object that allows us to recieve info about a LatLng
   * functions:
   *    find_location: find a location based on latlng
   */
  var geocode = {
    geocoder: new google.maps.Geocoder(),
    /*
     * Find a location based on a latlng
     * laglng: Latitude and Longitude we want information back on
     * callback: a callback function that is passed
     *  loc: a location object consisting of {zip, city, state}
     */
    find_location: function(latlng,callback) {
      this.geocoder.geocode({'latLng': latlng}, function(results,status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            var result = results[0];
            var loc = {};
            for(var i=0, len=result.address_components.length; i<len; i++) {
              var ac = result.address_components[i];
              if(ac.types.indexOf("postal_code") >= 0) loc["zip"] = ac.long_name;
              if(ac.types.indexOf("locality") >= 0) loc["city"] = ac.long_name;
              if(ac.types.indexOf("administrative_area_level_1") >= 0) loc["state"] = ac.long_name;
            }
            callback(loc);
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

/*
 * A suite of functions to retrieve information from the NOAA data service
 * This is currently not in use
 */
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


/*
 * A set of functions to retrieve soil information
 * functions:
 *  get_data: internal function to retrieve information from SoilWeb
 *  get_preference_info: retrieve preference information for a particular latlng
 *  get_soil_conditions: given an array of soil, retrieve information about them
 *  get_rainfall_events: for a particular latlng, return the number of rainfall events in a month
 *  convert_cords: change coordinates from neg/pos to E/W & N/S
 * @see http://en.wikipedia.org/wiki/Runoff_curve_number
 */
var soil = {
  
  get_data: function(lat,lon,callback) {
    $.ajax({
      url: window.location.protocol + "/api?url=" + encodeURIComponent("casoilresource.lawr.ucdavis.edu/gmap/get_mapunit_data.php?lat="+lat+"&lon="+lon),
      success: function(data) {
        callback(data);
      },
      error: function(jqXHR, textStatus,ex) {
        console.log(textStatus);
      }
    });
  },
  /*
   * Retrieve soil information for a particular latlon object
   * latLon: an object with {lat, lng}
   * callback: callback function called after this function is complete
   *    ret: information hash with:
   *        {flood, storage, drainage_wet, drainage_dom, wetland, table, soil, composition:
   *            [{plant_water, hydrologic, runoff, erosion}, ...] }
   */
  get_preference_info: function(latLon, callback) {
    var self = this;
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
      self.get_soil_conditions($('#loaderdiv').find('.data-list .comp-name a'),function(comp){
        ret["composition"] = comp;
        callback(ret);
      });
    });
  },
  /*
   * Get the information regarding the different soils provided in the array. Used by get_preference_info
   * soils: array of soil composition links
   * callback: callback function after this function is complete
   *    ret: [{plant_water, hydrologic, runoff, erosion}, ....]
   */
  get_soil_conditions: function(soils, callback) {
    var me = this;
    var requests = [];
    var ret = [];
    //Loop through each available soil type and spinoff an ajax request
    for(var i = 0; i < soils.length; i++)
    {
      requests.push($.ajax({
        url: 'casoilresource.lawr.ucdavis.edu/gmap/' + soils[i].dataset.url,
        method: 'get',
        beforeSend: function(xhr, settings) {
          settings.url = window.location.protocol + "/api?url=" + encodeURIComponent(settings.url);
          settings.crossDomain = false;
        },
      }));
      ret[i] = {percent: parseInt($(soils[i]).parent().prev().html().replace(/[^\d]*/g,''))};
    }

    //When the ajaz requests are done, then parse through them, pulling the info we want
    $.when.apply($, requests).then(function() {
      if(ret.length == 1) {
        $('#loaderdiv').empty();
        $('#loaderdiv').append($(arguments[0].replace(/src=[\S]+/g,'')));
        ret[0]["plant_water"] = $('#loaderdiv').find('.hyderosratings span:contains("Plant")').next().html().trim(); 
        ret[0]["hydrologic"] = $('#loaderdiv').find('.hyderosratings span:contains("Hydrologic")').next().html().trim().replace("Group ",""); 
        ret[0]["runoff"] = $('#loaderdiv').find('.hyderosratings span:contains("Runoff")').next().html().trim(); 
        ret[0]["erosion"] = $('#loaderdiv').find('.hyderosratings span:contains("Erosion")').next().html().trim(); 
      
      } 
      if (ret.length > 1) {
        for(var i = 0; i < ret.length; i++) {
          $('#loaderdiv').empty();
          $('#loaderdiv').append($(arguments[i][0].replace(/src=[\S]+/g,'')));
          ret[i]["plant_water"] = $('#loaderdiv').find('.hyderosratings span:contains("Plant")').next().html().trim(); 
          ret[i]["hydrologic"] = $('#loaderdiv').find('.hyderosratings span:contains("Hydrologic")').next().html().trim().replace("Group ",""); 
          ret[i]["runoff"] = $('#loaderdiv').find('.hyderosratings span:contains("Runoff")').next().html().trim(); 
          ret[i]["erosion"] = $('#loaderdiv').find('.hyderosratings span:contains("Erosion")').next().html().trim(); 
        }
      }
      //pass the pulled info to the callback
      callback(ret);
    });
  },
  //Found a data source for rainfall events 
  //@see http://iridl.ldeo.columbia.edu/SOURCES/.UEA/.CRU/.TS2p1/.climatology/.c7100/.wet/
  get_rainfall_events: function(latLon, callback) {
    var cords = this.convert_cords(latLon.lat, latLon.lng);
    var url = "iridl.ldeo.columbia.edu/SOURCES/.UEA/.CRU/.TS2p1/.climatology/.c7100/.wet/Y/";
    url += "("+cords.lat+")("+cords.lat+")RANGEEDGES/X/";
    url += "("+cords.lng+")("+cords.lng+")RANGEEDGES/T+exch+table-+text+text+skipanyNaN+-table+.html";

    $.ajax({
      url: url,
      method: 'get',
      beforeSend: function(xhr, settings) {
        settings.url = window.location.protocol + "/api?url=" + encodeURIComponent(settings.url);
        settings.crossDomain = false;
      },
      success: function(data) {
        var ret = [];
        $('#loaderdiv').html(data);
        var months = ["Jan", "Feb", "Mar", "Apr", "Mar", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for(var i = 0; i < months.length; i++) {
          ret.push(parseInt($('#loaderdiv td:contains("'+months[i]+'")').next().text()));
        }
        callback(ret);
      }
    });
  },
  convert_cords: function(lat,lon) {
    var ret = {};
    if(lat > 0) {ret["lat"] = Math.round(lat*100)/100 + "N";}
    if(lat <= 0) {ret["lat"] = Math.abs(Math.round(lat*100)/100) + "S";}
    if(lon > 0) {ret["lng"] = Math.round(lon*100)/100 + "E";}
    if(lon <= 0) {ret["lng"] = Math.abs(Math.round(lon*100)/100) + "W";}
    return ret;
  }
}

/*
 * A set of functions to retrieve soil information
 * functions:
 *  get_data: retrieve weather data using the Hamweather API.
 *  get_normals: get the normal monthly weather values for a particular location
 * @see http://www.hamweather.com/support/documentation/aeris/
 */
var Weather = {
  
  client_id: "nMCnfGEEaArwNARvEdiZb",
  client_secret: (window.location.host == "app-ecotouch.rhcloud.com")? "BCbLIz0jxx3XDzKtS2uUjtYJaoLpucSEk0Mi7Ate" : "i8by9MQMwt1p4MPrRoLmnHhYhu030KkqcX1g5vo8",
  normals: null,
  /*
   * Retrieve weather data using the Hamweather API.
   * action: action to perform as per the Hamweather documentation
   * loc: location type being based in by params
   * params: a set of parameters that correspond to action
   * callback: callback that returns after function is complete
   *    ret: data -- data object as defined by Hamweather API
   */
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
  location: {},
  climate: {},
  solar_size: 10,
  sqft: 2000,
  fuel: "natural_gas",
  efficient_fixtures: false,
  num_people: 4,
  weather: null,
  rates: null,
  rainfall_events: [], //TODO fix me for the biomes
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

/*
 * Represents the calculation functions that a building would use for its average consumption
 * outdoor_water_usage: calculates the outdoor water usage in gallons
 * electricity_usage: calculates electricity usage in kWh
 * setClimage: sets the climate of the display depending on a climate name string
 * runOff: calculates the amount of runoff for a month in inches
 * 
 */
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
    dishwasher_loads: 2, //# of dishwasher loads per week per person
    dishwasher_flow: 15, //Gallons per diswasher load
    laundry: 2, //Loads of laundry per week per person
    laundry_flow: 55, //Gallons for each load
  }, 
  
  outdoor_water_usage: function(month) {
    //Calculate this based on rainfall for the month
    if (Preferences.weather == null) { return 0 }
    //Not going to use any water if it is cold on average outside
    if (Preferences.weather[month].temp.avgF > 50) {
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
    total += 21 * Math.floor(Preferences.num_people / 2); // Computer 
    total += 1 * Preferences.num_people; //Cell Phones
    total += 23; //DVR
    total += (Preferences.num_people > 2)? 15:0; //Video game system
    total += 6; //Washing Machine
    total += 57; //Clothes dryer
    total  += 405; //Water heater
    return total
  },

  setClimate: function(name) {
    function contains(str,str1) {
      return str.indexOf(str1) > 0;
    }
    
    switch (true) {
      case contains(name,"temperate") && contains(name,"maritime"):
        $('body').css('background-image', 'url("../images/Background_Alpine.png")');
        return "Cold Mediteranian";
        break;
      case contains(name,"Subtropic") && contains(name,"macrotherm") && contains(name,"maritime"):
        $('body').css('background-image', 'url("../images/Background_Temperate.png")');
        return "Warm Mediteranian";
        break;
      case contains(name,"Subtropic") && contains(name,"megatherm") && contains(name,"maritime"):
        $('body').css('background-image', 'url("../images/Background_Temperate.png")');
        return "Warm Mediteranian";
        break;
      case contains(name,"temperate") && contains(name,"humid"):
        $('body').css('background-image', 'url("../images/Background_Temperate.png")');
        return "Cold Continental";
        break;
      case contains(name,"temperate") && contains(name,"arid"):
        $('body').css('background-image', 'url("../images/Background_Grassland.png")');
        return "Cold Grassland";
        break;
      case contains(name,"Subtropic") && contains(name,"mesotherm"):
        $('body').css('background-image', 'url("../images/Background_Grassland.png")');
        return "Warm Grassland";
        break;
      case contains(name,"Subtropic") && contains(name,"macrotherm"):
        $('body').css('background-image', 'url("../images/Background_Temperate.png")');
        return "Continental";
        break;
      case contains(name,"Subtropic") && contains(name,"megatherm") && contains(name,"humid"):
        $('body').css('background-image', 'url("../images/Background_Grassland.png")');
        return "Subtropic";
        break;
      case contains(name,"Subtropic") && contains(name,"megatherm") && contains(name,"arid"):
        $('body').css('background-image', 'url("../images/Background_Desert.png")');
        return "Desert";
        break;
      case contains(name,"Dry") && contains(name,"cold"):
        $('body').css('background-image', 'url("../images/Background_Alpine.png")');
        return "Mountain"
        break;
      case contains(name,"Dry") && contains(name,"warm"):
        $('body').css('background-image', 'url("../images/Background_Desert.png")');
        return "Desert";
        break;
      case contains(name,"Tropic"):
        $('body').css('background-image', 'url("../images/Background_Wetland.png")');
        return "Tropical";
        break;
    }
  },

  runoff: function(month) {
    var comps = Preferences.soil.composition
    var total = 0;
    for (var i = 0; i < comps.length; i++) {
      total += comps[i].percent; 
    }
    var CN = 0;
    for (var i = 0; i < comps.length; i++) {
      if(comps[i].percent > 0) {
        CN += this.runoff_curve[Preferences.sqft][comps[i].hydrologic] * (comps[i].percent / total); 
      }
    }
    if (CN < 1){ return 0; } //Issue calculating -- just set it to 0
    var events = Preferences.rainfall_events; 

    var P = Preferences.weather[month].prcp.mtdIN / events[month];
    var s = 1000/CN - 10;
    return ((Math.pow((P - 0.2 * s),2) / (P + 0.8 * s)) * events[month]) * this.runoff_curve[Preferences.sqft]["sqft"] * 0.623;
  },
  
  runoff_curve: {
    800: {A: 77, B: 85, C: 90, D: 92, sqft: 5445},
    1500: {A: 61, B: 75, C: 83, D: 87, sqft: 10890},
    2000: {A: 57, B: 72, C: 81, D: 86, sqft: 14520},
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
      async: false,
      success: callback,
    });
  },
  get_geothermal: function(lat,lon,fuel,square_feet,callback) {
    //Fuel Types: natural_gas, oil, propane, electricity
    //age: old, mid, new
    var self = this;
    $.ajax({
      url: 'www.waterfurnace.com/savings-calculator/v3.1.1/calculate.aspx',
      method: 'post',
      beforeSend: function(xhr, settings) {
        settings.url = window.location.protocol + "/api?url=" + encodeURIComponent(settings.url);
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

$(function(){
  google.maps.event.addDomListener(window, 'load', initialize);

  //Setup our datasliders to output their values when they are changed
  $('#preferences-form .btn-success').click(function() {
    var val = parseInt($('#preferences-form .output').html());
    $('#preferences-form .output').html((val < 6)? val + 1 : val);
  });
  
  $('#preferences-form .btn-danger').click(function() {
    var val = parseInt($('#preferences-form .output').html());
    $('#preferences-form .output').html((val > 1)? val - 1 : val);
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

