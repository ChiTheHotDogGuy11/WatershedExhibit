//Solar Power!
$(function() {
  //We need to get our solar power info
  var monthly_data;
  var scale = 0;

  var find_solar = function() {
    NREL.get_solar(Preferences.latLng.lat, Preferences.latLng.lng, Preferences.solar_size, function(data) {
      monthly_data = data.outputs;
    });
  };
  Preferences.bind("latLng", "solar_size", find_solar);

  Engine.new_system({
    name: "solar_panels",
    calculation_function: function (in_vars, out_vars, scale, active) {
      var month = in_vars["month"]
      if (Preferences.solar_size != scale) { Preferences.solar_size = scale; } //TODO we need to block on this... else the results are not accurate
      if (active) {
        out_vars["energy_consumption"] -= (monthly_data.ac_monthly[month] * in_vars["sun"]) * Preferences.rates.residential; //TODO multiple this by zero if wind broke the pannels?? 
      }
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      //They cost about 5 dollars per watt
      return scale * 5;
    },
  });
});

$(function() {

  var monthly_data;
  
  var find_geothermal = function() {
    NREL.get_geothermal(Preferences.latLng.lat, Preferences.latLng.lng, Preferences.fuel, Preferences.sqft, function(data) {
      monthly_data = data;
    }
  }
  Preferences.bind("latLng","fuel","sqft", find_geothermal);

  Engine.new_system({
    name: "geothermal",
    caluation_function: function(in_vars, out_vars, scale, active) {
      var month = in_vars["month"]
      if (active) {
        //TODO divide this by the fuel we chose
        out_vars["energy_consumption"] += monthly_data.heating_new[month] + monthly_data.cooling_new[month];
        out_vars["carbon"] += monthly_data.heating_carbon_new[month] + monthly_data.cooling_carbon_new[month];
      } else {
        out_vars["energy_consumption"] += monthly_data.heating_old[month] + monthly_data.cooling_old[month];
        out_vars["carbon"] += monthly_data.heating_carbon_old[month] + monthly_data.cooling_carbon_old[month];
      }
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) { return (2500 * Math.floor((Preferences.sqft / 600)) ) },
  });
});

$(function() {
 
  //One barrel is about 50 gallons
  // @see http://www.okc.gov/water/service/forms/householdwaterusage.aspx
  // @see http://www.tylertork.com/diyrainbarrels/calculator.html
  Engine.new_system({
    name: "rain_barrel",
    calculation_function: function(in_vars, out_vars, scale, active) {
      //We only get on overage half of the rain per month in our rain barrels
      if (active) {
        out_vars["outdoor_water"] -= Math.min((scale * 50 * 30.4),(((Preferences.sqft * 144) * (Preferences.weather.prcp.mtdIN/2)) / 231));       
      }
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) { 
        return scale * 250;
    }
  });

});

$(function() {
  //Could have this be a system for energy-efficient appliances?? Change values depending on efficiency
  Engine.new_system({
    name: "living_systems",
    calculation_function: function(in_vars, out_vars, scale, active) {
      out_vars["outdoor_water"] += Building.outdoor_water_usage(in_vars["month"]);
      out_vars["indoor_water"] += Building.indoor_water_usage({});
      out_vars["energy_consumption"] += Building.electricity_usage * Preferences.rates.residential;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      return 0;
    },
  });
});

