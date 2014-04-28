$(function() {
  var storm_params = {
    name: "storm",
    duration: 2,
    probability : 0,
    on_init: function(duration, cur_inputs) {
      // console.log("begin storm");
      alert("Storm has begun");
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] -= .7;
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
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] += .7;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(storm_params);
  
  var price_hike_params = {
    name: "price_hike",
    duration: 2,
    probability : 0,
    on_init: function(duration, cur_inputs) {
      alert("Price hike has begun");
      // console.log("begin price hike");
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] -= .7;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end price hike");
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] += .7;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(price_hike_params);
  
  var drought_params = {
    name: "drought",
    duration: 2,
    probability : 100,
    on_init: function(duration, cur_inputs) {
      // console.log("begin drought");
      alert("Drought has begun");
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] += .7;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end drought");
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] -= .7;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(drought_params);
});