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
    calc: function (in_variables) {
      monthly_data.ac_monthly[in_variables["month"]] //TODO multiple this by zero if wind broke the pannels?? 
    }
  });
}
