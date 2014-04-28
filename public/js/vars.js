$(function() {
  var month_params = {
   name: "month", 
   timer_fired: function(cur_val, time_since_last_change) {
     if (time_since_last_change === 1) {
       if (cur_val === 11) return 0;
       else return cur_val + 1;
     }
   },
   on_update: function(newVal) {
     
   },
   init_value: 0
  };
  Engine.new_in_variable(month_params);
   
  Engine.new_out_variable({
   name: "outdoor_water",
   on_update: function(newVal) {}, 
   init_value: 0,
  });

  Engine.new_out_variable({
   name: "indoor_water",
   on_update: function(newVal) {}, 
   init_value: 1000,
  });

  Engine.new_out_variable({
   name: "energy_consumption",
   on_update: function(newVal) {}, 
   init_value: 0,
  });

  Engine.new_out_variable({
   name: "runoff",
   on_update: function(newVal) {}, 
   init_value: 0,
  });

  Engine.new_out_variable({
   name: "carbon",
   on_update: function(newVal) {}, 
   init_value: 0,
  });
  
  Engine.new_in_variable({
    name: "rain",
    timer_fired: function(cur_val, time_since_last_change) {
      return cur_val;
    },
    on_update: function(newVal) {
      //console.log("New rain val: " + newVal);
    },
    init_value: 1
  });
  Engine.new_in_variable({
    name: "sun",
    timer_fired: function(cur_val, time_since_last_change) {
      return cur_val;
    },
    on_update: function(newVal) {
      //console.log("New sun val: " + newVal);
    },
    init_value: 1
  });
});
