
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
  var loc = null;
  
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

  function simulate(steps){
    steps = typeof steps !== 'undefined' ? steps : 1;
    //Run the simulation for the number of steps we have defined
    for (var i = 0; i < steps; i++)
    {
      //Determine if/which event is going to occur

      //Update our inVariables
      var in_vars = {}
      for(var key in in_variables) {
        if(in_variables.hasOwnProperty(key)) {
          //Do something with events here to do a calculation??  
          in_vars[key] = in_variables.calculate_value(loc,events);
        }
      }
      
      //Calculate the output variables depending on the input variables
      var updated_values = {};
      for(var key in systems) {
        if (systems.hasOwnProperty(key)) {
          var output = systems[key].calc(in_vars)
          for(var key in output) {
            if(output.hasOwnProperty(key) && out_variables.hasOwnProperty(key)) {
              updated_values[key] += output[key]
            }
          }
        }
      }
     
      //No updated the output variables
      for(var key in out_variables) {
        if(out_variables.hasOwnProperty(key) && updated_values.hasOwnProperty(key)) {
           out_variables[key].push_value(updated_values[key])
        }
      }

    }
  };
  
  function Variable(params_hash){
    this.name = params_hash["name"] || "TMP"; 
    this.values = new Array();
  };

  Variable.prototype.current_value = function() {
    return this.values[this.length-1];
  };

  Variable.prototype.push_value = function(val) {
    this.values.push(val);
  };

  /**
   *  Define new out variables by:
   *   Engine.new_out_variable({
   *      // Function to update after a new value
   *      on_update: function() { } 
   *  })
   */
  function OutVariable(params_hash) {
    Variable.call(this, params_hash);
    this.on_upate = params_hash["on_update"];
  };
  
  OutVariable.prototype = Object.create( Variable.prototype );
  OutVariable.prototype.constructor = OutVariable; 
  OutVariable.prototype.push_value = function(val) {
    this.push_value(val);
    this.on_update();
  };

  /**
   *  Define new in variables by:
   *  Engine.new_in_variable({
   *     
   *  })
   */
  function InVariable(params_hash) {
    Variable.call(this, params_hash);
  };

  InVariable.prototype = Object.create( Variable.prototype );
  InVariable.prototype.constructor = InVariable;
  InVariable.prototype.calculate_value = function (loc,events);

  /**
   *  Define new systems by:
   *    Engine.new_system({
   *      //A list of variables for the system calculation to use
   *      vars: { } 
   *      // The calculation function
   *      calc: function (in_variables) { 
   *              return {out_variables}  
   *            }    
   *      piece: new Piece()
   *    
   *    
   *    })
   */
  function System(params_hash){

    //Iterate through the variables and make them object keys
    params_hash["vars"] = params_hash["vars"] || new Array();
    for(var key in params_hash["vars"]) {
      if (params_hash["vars"].hasOwnProperty(key)) {
        this[key + "_val"] = params_hash[key];
      }
    }

    //Define set objects
    this.piece = params_hash["piece"];
    this.calc = params_hash['calculation_function']; 
  };

  return {
    new_system: new_system,
    new_out_variable: new_out_variable,
    new_in_variable: new_in_variable,
    set_location: set_location,
    simulate: simulate,
      
  }

})(Engine || {});

