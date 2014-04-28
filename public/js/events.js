$(function() {
  var storm_params = {
    name: "storm",
    duration: 2,
    probability : 1,
    on_init: function(duration, cur_inputs) {
      // console.log("begin storm");
      //alert("Storm has begun");
      cur_inputs["rain"] += .2;
      cur_inputs["sun"] -= .2;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      // console.log("storm time remaining: " + time_left);
      //cur_inputs["rain"] += 2;
      //cur_inputs["sun"] -= 4;
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end storm");
      cur_inputs["rain"] -= .2;
      cur_inputs["sun"] += .2;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(storm_params);
  
  var price_hike_params = {
    name: "price_hike",
    duration: 2,
    probability : 1,
    on_init: function(duration, cur_inputs) {
      // console.log("begin price hike");
      cur_inputs["rain"] -= .3;
      cur_inputs["sun"] -= .3;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end price hike");
      cur_inputs["rain"] += .3;
      cur_inputs["sun"] += .3;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(price_hike_params);
  
  var drought_params = {
    name: "drought",
    duration: 3,
    probability : 1,
    on_init: function(duration, cur_inputs) {
      // console.log("begin drought");
      cur_inputs["rain"] -= .3;
      cur_inputs["sun"] += .3;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end drought");
      cur_inputs["rain"] += .3;
      cur_inputs["sun"] -= .3;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(drought_params);
});