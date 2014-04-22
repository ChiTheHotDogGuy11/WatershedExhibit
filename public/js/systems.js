//Solar Power!
$(function() {
  //We need to get our solar power info
  var monthly_data;

  var find_solar = function() {
    NREL.get_solar(Preferences.latLng.lat, Preferences.latLng.lng, Preferences.solar_size, function(data) {
      monthly_data = data.outputs;
    });
  };
  Preferences.bind("latLng", "solar_size", find_solar);
  //TODO scale -- repull info for scale

  Engine.new_system({
    name: "solar_panels",
    calculation_function: function (in_vars, out_vars, scale, active) {
      var month = in_vars["month"]
      if (active) {
        out_vars["energy_consumption"] -= (monthly_data.ac_monthly[month] * in_vars["sun"]) * Preferences.rates.residential; //TODO multiple this by zero if wind broke the pannels?? 
      }
    },
    piece: undefined,
    vars: ["month"]
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
        out_vars["energy_consumption"] += monthly_data.heating_carbon_old[month] + monthly_data.cooling_carbon_old[month];
      }
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) { (2500 * Math.floor((Preferences.sqft / 600)) ) },
  });
});

$(function() {
  
  Engine.new_system({
    name: "rain_barrel",
    calculation_function: function(in_vars, out_vars, scale, active) {
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) { }
  });

});
