  /**
   *    Relatively simple container for the possible events
   *    that can occur. It manages both starting/ending new
   *    events and progressing along those that have already
   *    begun.
   **/
function EventManager(events) {
  this.events = events;
  this.ongoing_events = {};
};

EventManager.prototype.add_event = function(new_event) {
  this.events[new_event.name] = new_event;
}

EventManager.prototype.timer_fired = function() {
  var cur_rand_num = -1;
  this.ongoing_events = {};
  for (var cur_event_name in this.events)  {
    var cur_event = this.events[cur_event_name];
    //Generate random integer between 0-99 (inclusive)
    cur_rand_num = Math.floor(Math.random()*99);
    cur_event.timer_fired(cur_rand_num);
    if (cur_event.is_ongoing()) {
      this.ongoing_events[cur_event.name] = cur_event;
    }
  }
};

EventManager.prototype.get_ongoing_events = function() {
  return this.ongoing_events;
};

  /**
   *  Define new events by:
   *   new Event({
   *      // Name of event
   *      name: $name,
   *
   *      // The number of time-steps the event should last
   *      duration: $duration,
   *
   *      // The probability of the event occurring (integer
   *      // between 0-99 inclusive
   *      probability: $probability,
   *
   *      // Function called when event is triggered.
   *      on_init: function(duration) {},
   *
   *      // Function called when event is in progress and
   *      // the timer is fired.
   *      on_update: function(duration, time_remaining) {},
   *
   *      // Function called when an iteration of the event 
   *      // terminates.
   *      on_terminate: function(duration) {},
   *  
   *      //Input variables that this event modifies (as associative array).
   *      input_vars: {}
   *   })
   */
function Event(params_hash) {
  this.name = params_hash["name"] || "TMP"; 
  this.duration = params_hash["duration"] || 1;
  //Probability modelled as integer between 0-99 (inclusive).
  this.probability = params_hash["probability"] | 10;
  this.on_init = params_hash["on_init"];
  this.on_update = params_hash["on_update"];
  this.on_terminate = params_hash["on_terminate"];
  this.time_remaining = -1;
  this.input_vars = params_hash["input_vars"];
};

Event.prototype.is_ongoing = function() {
  return (this.time_remaining > 0);
};

Event.prototype.timer_fired = function(timer_probability) {
  //Event is ongoing and shouldn't terminate this round.
  if (this.time_remaining > 1) {
    this.time_remaining -= 1;
    this.on_update(this.duration, this.time_remaining);
  }
  //Event is ongoing and should terminate this round.
  else if (this.time_remaining == 1) {
    this.time_remaining = -1;
    this.on_terminate(this.duration);
  }
  //Event is not ongoing. Decide if we should start it up.
  else {
    if (timer_probability <= this.probability) {
      this.time_remaining = this.duration;
      this.on_init(this.duration);
    }
  }
};