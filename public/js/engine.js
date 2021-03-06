
/**
 * Put all of our engine code into the Engine workspace 
 * -- Also we have only one Engine object -- (ever)
 * 
 * @type {{init: Function, new_system: Function, new_out_variable: Function, new_in_variable: Function, simulate: Function }}
 *
 *
 */

var Engine = (function () {

  //Private Vars
  var systems = {};
  var in_variables = {};
  var out_variables = {};
  var budget;
  var loc = null;
  // A container for the events. See event.js
  var event_manager = new EventManager();
  //Keep track of the scores
  var scores = new Array();
  
  function new_event(params_hash, animParams) {
    var new_e = new Event(params_hash);
    new_e.startF = animParams.startF;
    new_e.endF = animParams.endF;
    new_e.paused = true;
    new_e.curFrame = 1;
    new_e.play = function(){
      this.paused = false;
    };
    new_e.pause = function(){
      this.paused = true;
      for(var i = animParams.startF; i <= animParams.endF; i++){
        $('#'+this.name+'_frame'+i).hide();
      }
    };
    for(var i = animParams.startF; i <= animParams.endF; i++){
      var frame = $('<img/>', {
        src: 'images/animations/'+new_e.name+'/'+i+'.png',
        class: new_e.name+'_frame',
        id: new_e.name+'_frame'+i,
        });
      $('#animAssets').append(frame);
    }
    event_manager.add_event(new_e);
    setInterval(function(){
      if(!new_e.paused){
        $('#'+new_e.name+'_frame'+new_e.curFrame).hide();
        new_e.curFrame = new_e.curFrame >= new_e.endF ? 1 : new_e.curFrame+1;
        $('#'+new_e.name+'_frame'+new_e.curFrame).show();
      }
    }, 150);
  };
  
  function event_play(event_name){
    event_manager.event_play(event_name);
  }

  function event_pause(event_name){
    event_manager.event_pause(event_name);
  }

  function new_system(params_hash){
    var tmp = new System(params_hash);
    systems[tmp.name] = tmp;
  };

  function new_out_variable(params_hash){
    var tmp = new OutVariable(params_hash);
    out_variables[tmp.name] = tmp;
  };

  function new_in_variable(params_hash){
    var tmp = new InVariable(params_hash);
    in_variables[tmp.name] = tmp;
  };

  function set_location(new_loc){
    loc = new_loc 
  };

  function get_scores() {
    return scores;
  };
  
  function set_system_active(system_name, is_active) {
    if (systems[system_name]) {
      systems[system_name].set_active(is_active);
    }
  };
  
  function set_system_scale(system_name, scale) {
    if (systems[system_name]) {
      systems[system_name].set_scale(scale);
    }
  };
  
  function simulate(steps){
    steps = typeof steps !== 'undefined' ? steps : 1;
    //Run the simulation for the number of steps we have defined
    for (var i = 0; i < steps; i++)
    {

      //Let the input variables change themselves if they like.
      for (var var_name in in_variables) {
        var cur_var = in_variables[var_name];
        var cur_val = cur_var.current_value();
        var new_val = cur_var.timer_fired(cur_val, cur_var.time_since_last_change);
        if (new_val !== cur_val) {
          in_variables[var_name].set_value(new_val);
        }
        else {
          in_variables[var_name].time_since_last_change += 1;
        }
        
      }
      //Update our inVariables
      var in_vars = {}
      //Fire the event timer to decide if/which event occurs and 
      //step along the events already in progress. Also update all 
      //the in_variables that the events modify.
      event_manager.timer_fired();

      for(var key in in_variables) {
        if(in_variables.hasOwnProperty(key)) { 
          in_vars[key] = in_variables[key].current_value();
        }
      }
      
      var out_vars = {};
      for (var out_name in out_variables) {
        out_vars[out_name] = 0;//out_variables[out_name].current_value();
      }
      // out_vars["outdoor_water"] = 0;
      // out_vars["indoor_water"] = 0;
      // out_vars["energy_consumption"] = 0;
      
      //Pass the latest input variables to the systems, 
      //and have them update the output variables they
      //care about.
      var updated_out_values = {};

      for (var sys_name in systems) {
        var cur_system = systems[sys_name];
        //Get the in-values for the variables this system cares about,
        // formed as {var_name: cur_var_value, ...}
        var pertinent_vars = {};
        //Make sure we only capture the input variables that this
        //system has said it cares about.
        for (input_var_name in cur_system.vars) {
          pertinent_vars[input_var_name] = in_vars[input_var_name];
        }
        //Capture the output variables that this event might
        // have changed.
        var changed_vals = cur_system.calc(in_vars, out_vars, cur_system.scale, cur_system.active);
        //Update the now-outdated values we have in cur_in_vals.
        for (var var_name in changed_vals) {
          out_vars[var_name] = changed_vals[var_name];
        }
      }
      
      //Now update the output vars.
      for (var var_name in out_vars) {
        out_variables[var_name].push_value(Math.max(0,out_vars[var_name]));
        //out_variables[var_name].push_value(out_vars[var_name]);
      }

    }
  };
  
  function Variable(params_hash){
    this.name = params_hash["name"] || "TMP"; 
    this.values = new Array();
    this.pastValues = [];
  };

  Variable.prototype.current_value = function() {
    return this.values[this.values.length-1];
  };

  Variable.prototype.push_value = function(val) {
    this.values.push(val);
  };

  Variable.prototype.get_values = function(){
    return this.values;
  }

  Variable.prototype.save = function(){
    var newValue = this.values[this.values.length-1];
    this.pastValues.push(this.values.slice(0, this.values.length-1));
    this.values = [0];
    return this.pastValues.length-1;
  }

  Variable.prototype.get_past_values = function(id){
    return this.pastValues[id];
  }

  /**
   *  Define new out variables by:
   *   Engine.new_out_variable({
   *      // Function to update after a new value
   *      on_update: function(new_val) { } 
   *  })
   */
  function OutVariable(params_hash) {
    Variable.call(this, params_hash);
    this.on_update = params_hash["on_update"];
    this.init_value = params_hash["init_value"] || 1;
    this.push_value(this.init_value);
  };
  
  OutVariable.prototype = Object.create( Variable.prototype );
  OutVariable.prototype.constructor = OutVariable; 
  OutVariable.prototype.push_value = function(new_val) {
    //Not the best way, but I don't know how to do inheritance in js
    this.values.push(new_val);
    this.on_update(new_val);
  };

  /**
   *  Define new in variables by:
   *  Engine.new_in_variable({
   *     
   *  })
   */
  function InVariable(params_hash) {
    Variable.call(this, params_hash);
    this.on_update = params_hash["on_update"];
    this.time_since_last_change = 1;
    this.timer_fired = params_hash["timer_fired"];
    this.init_value = params_hash["init_value"] || -1;
    this.set_value(this.init_value);
  };

  InVariable.prototype = Object.create( Variable.prototype );
  InVariable.prototype.constructor = InVariable;
  /*InVariable.prototype.calculate_value = function (loc,events){
    var val = 0;
    this.push_value(val)
    return val;
  };*/
  InVariable.prototype.set_value = function(new_val) {
    var before_val = this.current_value();
    this.push_value(new_val);
    this.on_update(new_val);
    if (new_val !== before_val) {
      this.time_since_last_change = 1;
    }
  };

  function Budget(params_hash) {
    this.money_left = params_hash["init_val"] || 0;
    this.on_change = params_hash["on_change"];
  }
  
  Budget.prototype.change_budget = function(delta) {
    if (delta > 0) {
      this.money_left = this.money_left + delta;
      this.on_change(this.money_left, delta);
    }
  }
  
  Budget.get_val = function() {
    return this.money_left;
  }
  /**
   *  Define new systems by:
   *    Engine.new_system({
   *      //A list of variables for the system calculation to use
   *      vars: { } 
   *      // The calculation function
   *      calc: function (in_variables, out_variables) { 
   *              return {new_out_variables}  
   *            }    
   *      piece: new Piece()
   *    
   *    
   *    })
   */
  function System(params_hash){

    //Iterate through the variables and make them object keys
    params_hash["vars"] = params_hash["vars"] || new Array();
    this.in_vars = {};
    for (var i = 0; i < params_hash["vars"].length; i++) {
      var cur_name = params_hash["vars"][i];
      if (in_variables[cur_name]) {
        this.in_vars[cur_name] = in_variables[cur_name];
      }
    }

    //Define set objects
    params_hash["name"] = params_hash["name"] || "TMP";
    this.name = params_hash["name"];
    this.maxScale = params_hash['maxScale'];
    this.piece = params_hash["piece"];
    //this.calc = params_hash['calculation_function']; 
    this.cost = params_hash["cost"];
    //this.isActive = false;
    this.scale = 1;
    this.is_purchased = false;
    //if (params_hash["scale"]) this.scale = params_hash["scale"];
    this.calc = function(in_vars, out_vars, scale, active) { 
      var ret = params_hash['calculation_function'](in_vars, $.extend({},out_vars), scale, active) 
      if (this.active) {
        var inactive = params_hash['calculation_function'](in_vars, $.extend({},out_vars), scale, false);
        //The number multiplied at the end is the "weight" -- we can change this to emphasize different features
        var month_score = 0;
        //TODO to do this properly, we really should really assign a weight to output variables and then iterate over the vars
        month_score += Math.round((inactive["outdoor_water"] - ret["outdoor_water"]));
        month_score += Math.round((inactive["energy_consumption"] - ret["energy_consumption"]));
        month_score += Math.round((inactive["runoff"] - ret["runoff"]));
        month_score += Math.round((inactive["indoor_water"] - ret["indoor_water"]));
        this.score += (month_score / 5); // To make sure our variable doesn't get too big
      }
      return ret;
    };
    this.active = false;
    this.scale = params_hash['scale'];
    this.score = 0;
    this.past_scores = new Array();
  };

  System.prototype.save_score = function() {
    this.past_scores.push(this.score);
    this.score = 0;
  }

  System.prototype.get_past_score = function(id) {
    return this.past_scores[id];
  }
  
  System.prototype.toggle = function(){
    this.active = !this.active;
    if(this.active && GameState.state() == GAMESTATE_PROMPT_SLOT){
        GameState.step();
    }
    else if(this.active && GameState.state() == GAMESTATE_PROMPT_ICON){
        GameState.step();
        GameState.step();
    }
  }

  System.prototype.scaleUp = function(){
    this.scale = Math.min(this.maxScale, this.scale+1);
  }

  System.prototype.scaleDown = function(){
    this.scale = Math.max(1, this.scale-1);
  }
  
  System.prototype.set_active = function(isActive) {
    if (isActive && !this.is_purchased) {
      var sys_cost = this.cost(this.scale);
      if (budget.get_val() >= sys_cost) {
        this.is_purchased = true;
        budget.change_budget(sys_cost);
      }
    }
    this.isActive = isActive;
  }
  
  System.prototype.set_scale = function(scale) {
    var cur_scale = this.scale;
    var additional_cost = this.cost(cur_scale) - this.cost(scale);
    budget.change_budget(additional_cost);
    this.scale = scale;
  }

      /**
     *    Relatively simple container for the possible events
     *    that can occur. It manages both starting/ending new
     *    events and progressing along those that have already
     *    begun.
     **/
  function EventManager(events) {
    events = events || {};
    this.events = events;
    this.ongoing_events = {};
  };

  EventManager.prototype.terminate_events = function() {
    var cur_in_vals = {};
    for (var cur_in_var in in_variables) {
      cur_in_vals[cur_in_var] = in_variables[cur_in_var].current_value();
    }
    var pertinent_vars = {};
    for (var cur_event_name in this.events) {
      var cur_event = this.events[cur_event_name];
      for (var i = 0; i < cur_event.input_vars.length; i++) {
        var input_name = cur_event.input_vars[i];
        pertinent_vars[input_name] = cur_in_vals[input_name];
      }
      cur_event.force_terminate(pertinent_vars);
    }
  }
  
  EventManager.prototype.add_event = function(new_event_o) {
    this.events[new_event_o.name] = new_event_o;
  }

  EventManager.prototype.event_play = function(event_name){
    this.events[event_name].play();
  }

  EventManager.prototype.event_pause = function(event_name){
    this.events[event_name].pause();
  }

  EventManager.prototype.timer_fired = function() {
    this.ongoing_events = {};
    //Keep track of input variables, and modify them as needed
    //as cur_event.timer_fired() returns. 
    //After everything, push the new values.
    var cur_in_vals = {};
    for (var cur_in_var in in_variables) {
      cur_in_vals[cur_in_var] = in_variables[cur_in_var].current_value();
    }
    var cur_rand_num = -1;
    for (var cur_event_name in this.events)  {
      var cur_event = this.events[cur_event_name];
      //Generate random integer between 0-99 (inclusive)
      cur_rand_num = Math.floor(Math.random()*99);
      //Get the in-values for the variables this event cares about,
      // formed as {var_name: cur_var_value, ...}
      var pertinent_vars = {};
      for (var i = 0; i < cur_event.input_vars.length; i++) {
        var input_name = cur_event.input_vars[i];
        pertinent_vars[input_name] = cur_in_vals[input_name];
      }
      /*for (input_var in cur_event.input_vars) {
        pertinent_vars[input_var] = cur_in_vals[input_var];
      }*/
      //Capture the input variables that this event might
      // have changed.
      var changed_vals = cur_event.timer_fired(cur_rand_num, pertinent_vars);
      //Update the now-outdated values we have in cur_in_vals.
      for (var var_name in changed_vals) {
        cur_in_vals[var_name] = changed_vals[var_name];
      }
      if (cur_event.is_ongoing()) {
        this.ongoing_events[cur_event.name] = cur_event;
      }
    }
    //Now we have the latest version of the input vars.
    for (var var_name in cur_in_vals) {
      in_variables[var_name].set_value(cur_in_vals[var_name]);
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
     *      on_init: function(duration, input_vars) {},
     *
     *      // Function called when event is in progress and
     *      // the timer is fired.
     *      on_update: function(duration, time_remaining, input_vars) {},
     *
     *      // Function called when an iteration of the event 
     *      // terminates.
     *      on_terminate: function(duration, input_vars) {},
     *  
     *      //Input variables that this event modifies (as associative array).
     *      input_vars: {}
     *   })
     */
  function Event(params_hash) {
    this.name = params_hash["name"] || "TMP"; 
    this.duration = params_hash["duration"] || 1;
    //Probability modelled as integer between 0-99 (inclusive).
    this.probability = params_hash["probability"];
    this.on_init = params_hash["on_init"];
    this.on_update = params_hash["on_update"];
    this.on_terminate = params_hash["on_terminate"];
    this.time_remaining = -1;
    this.input_vars = new Array();
    for (var i = 0; i < params_hash["input_vars"].length; i++) {
      var cur_name = params_hash["input_vars"][i];
      if (in_variables[cur_name]) {
        //this.in_vars[cur_name] = in_variables[cur_name];
        this.input_vars.push(cur_name);
      }
    }
  };

  Event.prototype.is_ongoing = function() {
    return (this.time_remaining > 0);
  };

  Event.prototype.timer_fired = function(timer_probability, pertinent_vars) {
    //Event is ongoing and shouldn't terminate this round.
    if (this.time_remaining > 1) {
      this.time_remaining -= 1;
      return this.on_update(this.duration, this.time_remaining, pertinent_vars);
    }
    //Event is ongoing and should terminate this round.
    else if (this.time_remaining == 1) {
      this.time_remaining = -1;
      return this.on_terminate(this.duration, pertinent_vars);
    }
    //Event is not ongoing. Decide if we should start it up.
    else {
      if (timer_probability <= this.probability) {
        this.time_remaining = this.duration;
        return this.on_init(this.duration, pertinent_vars);
      }
    }
  };
  
  Event.prototype.force_terminate = function(pertinent_vars) {
    if (this.time_remaining >= 1) {
      this.time_remaining = -1;
      this.on_terminate(this.duration, pertinent_vars);
    }
  }

  return {
    new_system: new_system,
    new_out_variable: new_out_variable,
    new_in_variable: new_in_variable,
    set_location: set_location,
    simulate: simulate,
    new_event: new_event,
    event_play: event_play,
    event_pause: event_pause,
    out_variables: out_variables,
    systems: systems,
    in_variables: in_variables,
    event_manager: event_manager,
    get_scores: get_scores,
    set_system_active: set_system_active,
    set_system_scale: set_system_scale
  }

})(Engine || {});

