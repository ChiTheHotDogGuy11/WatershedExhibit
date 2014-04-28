$(function() {
  var storm_params = {
    name: "storm",
    duration: 3,
    probability : 40,
    on_init: function(duration, cur_inputs) {
      //alert("Storm has begun");
      cur_inputs["rain"] += .2;
      cur_inputs["sun"] -= .2;
      return cur_inputs;
    },
    on_update: function(duration, time_left, cur_inputs) {
      //console.log("storm time remaining: " + time_left);
      //cur_inputs["rain"] += 2;
      //cur_inputs["sun"] -= 4;
      return cur_inputs;
    },
    on_terminate: function(duration, cur_inputs) {
      cur_inputs["rain"] -= .2;
      cur_inputs["sun"] += .2;
      return cur_inputs;
    },
    input_vars: ["rain", "sun"]
  };
  Engine.new_event(storm_params);
});