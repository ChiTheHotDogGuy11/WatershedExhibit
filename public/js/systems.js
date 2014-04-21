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
  
  Engine.new_system({
    name: "solar_panels",
    calculation_function: function (in_vars, out_vars) {
      out_vars["energy_consumption"] -= monthly_data.ac_monthly[in_vars["month"]] //TODO multiple this by zero if wind broke the pannels?? 
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
    caluation_function: function(in_vars, out_vars) {
      out_vars["energy_consumption"] 
    },
    piece: undefined,
    vars: ["month"]
  });
});

//NOTE: for water -- either use the closest city, or calculate the cost for well
