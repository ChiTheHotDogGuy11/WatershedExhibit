$(function() {
  var storm_params = {
    name: "storm",
    duration: 2,
    probability : 10,
    on_init: function(duration, cur_inputs) {
      $('#prompt').text('begin storm!');
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] -= .7;
      Engine.event_play("storm");
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      $('#prompt').text('end storm!');
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] += .7;
      Engine.event_pause("storm");
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(storm_params, {startF:1, endF: 12});
  
  var price_hike_params = {
    name: "price_hike",
    duration: 2,
    probability : 0,
    on_init: function(duration, cur_inputs) {
      // console.log("begin price hike");
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] -= .7;
      Engine.event_play("price_hike");
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end price hike");
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] += .7;
      Engine.event_pause("price_hike");
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(price_hike_params, {startF:1, endF: 0});
  
  var drought_params = {
    name: "drought",
    duration: 2,
    probability : 0,
    on_init: function(duration, cur_inputs) {
      // console.log("begin drought");
      cur_inputs["rain"] -= .7;
      cur_inputs["sun"] += .7;
      Engine.event_play("drought");
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      // console.log("end drought");
      cur_inputs["rain"] += .7;
      cur_inputs["sun"] -= .7;
      Engine.event_pause("drought");
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(drought_params, {startF:1, endF: 0});
});