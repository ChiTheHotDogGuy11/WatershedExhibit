$(function() {
  var season_params = {
    name: "month", 
    timer_fired: function(cur_val, time_since_last_change) {
      if (time_since_last_change === 1) {
        if (cur_val === 11) return 0;
        else return cur_val + 1;
      }
    },
    on_update: function(newVal) {
      $("#season").html("season: " + newVal);
    },
    init_value: 0
  };
});