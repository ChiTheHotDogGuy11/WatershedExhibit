$(function() {
  //Could have this be a system for energy-efficient appliances?? Change values depending on efficiency
  Engine.new_system({
    name: "living_systems",
    calculation_function: function(in_vars, out_vars, scale, active) {
      out_vars["outdoor_water"] = Building.outdoor_water_usage(in_vars["month"]);
      out_vars["indoor_water"] = Building.indoor_water_usage({});
      out_vars["energy_consumption"] = Building.electricity_usage() * Preferences.rates.residential;
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      return 0;
    },
  });
});

//Solar Power!
$(function() {
  //We need to get our solar power info
  var monthly_data;
  var scale = 1;

  var find_solar = function() {
    NREL.get_solar(Preferences.latLng.lat, Preferences.latLng.lng, Preferences.solar_size, function(data) {
      monthly_data = data.outputs;
    });
  };
  Preferences.bind("latLng", "solar_size", find_solar);

  Engine.new_system({
    name: "solar_panel",
    calculation_function: function (in_vars, out_vars, scale, active) {
      var month = in_vars["month"]
      if (Preferences.solar_size != scale) { Preferences.solar_size = 1000 * scale; } //TODO we need to block on this... else the results are not accurate
      if (active) {
        out_vars["energy_consumption"] -= (monthly_data.ac_monthly[month] * in_vars["sun"]) * Preferences.rates.residential; //TODO multiple this by zero if wind broke the pannels?? 
        //out_vars["energy_consumption"] -= 10000 * in_vars["sun"];
      }
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    scale: 1,
    cost: function(scale) {
      //They cost about 5 dollars per watt
      // return scale * 5 * 1000;
      return 10+scale * 2;
    },
  });
});

$(function() {

  var monthly_data;
  
  var find_geothermal = function() {
    NREL.get_geothermal(Preferences.latLng.lat, Preferences.latLng.lng, Preferences.fuel, Preferences.sqft, function(data) {
      monthly_data = data;
    });
  }
  Preferences.bind("rates","fuel","sqft", find_geothermal);

  Engine.new_system({
    name: "geo_thermal",
    calculation_function: function(in_vars, out_vars, scale, active) {
      var month = in_vars["month"]
      if (active) {
        //TODO divide this by the fuel we chose
        out_vars["energy_consumption"] += parseFloat(monthly_data.heating_new[month]) + parseFloat(monthly_data.cooling_new[month]);
        out_vars["carbon"] += parseFloat(monthly_data.heating_carbon_new[month]) + parseFloat(monthly_data.cooling_carbon_new[month]);
      } else {
        out_vars["energy_consumption"] += parseFloat(monthly_data.heating_old[month]) + parseFloat(monthly_data.cooling_old[month]);
        out_vars["carbon"] += parseFloat(monthly_data.heating_carbon_old[month]) + parseFloat(monthly_data.cooling_carbon_old[month]);
      }
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    scale: 1,
    //TODO what happened to the cost here? also this doesnt scale
    cost: function(scale) { return 42 + (scale-1) * (2) },
  });
});

$(function() {
 
  //One barrel is about 50 gallons
  // @see http://www.okc.gov/water/service/forms/householdwaterusage.aspx
  // @see http://www.tylertork.com/diyrainbarrels/calculator.html
  Engine.new_system({
    name: "rain_barrel",
    calculation_function: function(in_vars, out_vars, scale, active) {
      //We use all of the rainwater that we capture in our rainbarrels each month
      if (active) {
        //var captured_water = Math.min((scale * 50 * 4),(Preferences.sqft * Preferences.weather.prcp.mtdIN * in_vars["rain"] * 0.623)); 
        var captured_water = scale*50*4;
        out_vars["outdoor_water"] -= captured_water; 
        out_vars["runoff"] -= captured_water;
      }
      return out_vars;
    },
    piece: undefined,
    scale: 1,
    vars: ["month"],
    cost: function(scale) { 
        return scale * 0.25;
    }
  });

});

$(function() {
  //Could have this be a system for energy-efficient appliances?? Change values depending on efficiency
  Engine.new_system({
    name: "living_systems",
    calculation_function: function(in_vars, out_vars, scale, active) {
      out_vars["outdoor_water"] += Building.outdoor_water_usage(in_vars["month"]);
      out_vars["energy_consumption"] += Building.electricity_usage() * Preferences.rates.residential;
      out_vars["runoff"] = Building.runoff(in_vars["month"])
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      return 0;
    },
  });
});

$(function() {

  Engine.new_system({
    name: "rain_garden",
    calculation_function: function(in_vars, out_vars, scale, active) {
      if (active) {
        out_vars["runoff"] -= 200 * scale;
      }
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      return 300 * scale //about 1000 for a really good rain garden -- the most effective
    }
  });
});

//TODO grey water and rain garden 
$(function() {

  Engine.new_system({
    name: "grey_water",
    calculation_function: function(in_vars, out_vars, scale, active) {
      if (active) {
        var params = Building.default_params;
        out_vars["indoor_water"] -= Math.round(Preferences.num_people * 1.6 * params.toilet_flushes) * 30.4;
        //They only supply as much water as a 1.6 flush toilet can use
      }
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      return 300 * Math.floor(Preferences.sqft / 700) //Number of systems installed -- max depending on the size of the house
    }
  });
});

$(function() {

  Engine.new_system({
    name: "water_fixtures",
    calculation_function: function(in_vars, out_vars, scale, active) {
      var params = Building.default_params;
      if (active) {
        var diff_total = 0;
        if (scale > 0) {
          params["shower_flow"] = 2.5;
          params["gpf"] = 1.6; 
        }
        if (scale > 1) {
          params["laundry_flow"] = 20; 
        }
        if (scale > 2) {
          params["dishwasher_flow"] = 7; 
        }
      }  
      var bathtotal = Math.round((params.showers * params.shower_time * params.shower_flow * Preferences.num_people) + (params.baths / 7 * 40));
      var toiletday = Math.round(Preferences.num_people * params.gpf * params.toilet_flushes);
      var faucetday = Math.round(params.faucet * Preferences.num_people * params.faucet_min * 3);
      var dishwasherday = Math.round((params.dishwasher_loads * Preferences.num_people * params.dishwasher_flow)/7);
      var laundryday = Math.round((params.laundry * Preferences.num_people * params.laundry_flow)/7);
      var dishday = Math.round(params.hand_dishes * params.hand_min * 3);
      var indoorday = Math.round(bathtotal + toiletday + faucetday + laundryday + dishwasherday + dishday);
      out_vars["indoor_water"] += indoorday * 30.4;
      return out_vars;
    },
    piece: undefined,
    vars: ["month"],
    cost: function(scale) {
      var cost = 0;
      if (scale > 0) {
        cost += 600 * Math.floor(Preferences.sqft / 700); //Multiply by the number of bathrooms in the house
      } if (scale > 1) {
        cost += 700
      } if (scale > 2) {
        cost += 800
      }
      return cost;
    },

  });
});

