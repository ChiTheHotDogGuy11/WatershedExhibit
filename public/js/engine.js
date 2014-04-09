
/**
 * Put all of our engine code into the Engine workspace 
 * -- Also we have only one Engine object -- (ever)
 * 
 * @type {{init: Function, new_system: Function, new_out_variable: Function, new_in_variable: Function, simulate: Function }}
 *
 *
 */

var Engine = {

  init: false;
  systems: new Array(),
  in_variables: new Array(),
  out_variables: new Array(),
  init: function() {
    for(var key in in_variables) {
      if (in_variables.hasOwnProperty(key)) {
        in_variables[key].init();
      }
    }
    for(var key in out_variables) {
      if (out_variables.hasOwnProperty(key)) {
        out_variavles[key].init();
      }
    }
    for(var key in systems) {
      if (systems.hasOwnProperty(key)) {
        systems.init();
      }
    }
    self.init = true;
  },

  new_system: function(params_hash){
    var tmp = new System(params_hash);
    this.systems[tmp.name] = tmp;
  },

  new_out_variable: function(params_hash){
    var tmp = new OutVariable(params_hash);
    this.out_variables[tmp.name] = tmp;
  },

  new_in_variable: function(params_hash){
    var tmp = new InVariable(params_hash);
    this.in_variables[tmp.name] = tmp;
  },

  set_location: function(new_loc){
    this.loc = new_loc 
  },

  simulate: function(steps){
    steps = typeof steps !== 'undefined' ? steps : 1;
    //Run the simulation for the number of steps we have defined
    for (var i = 0; i < steps; i++)
    {
      //Determine if/which event is going to occur

      for(var key in out_variables) {
        if(out_variables.hasOwnProperty(key)) {
          
        }
      }
      
      //Calculate the output variables depending on the input variables
      for(var key in systems) {
        if (systems.hasOwnProperty(key)) {
          systems[key].calc(in_variables)
        }
      }
    }
  }

  
  /**
   *  Define new variables by:
   *   Engine.new_variable({
   *   
   *  })
   */
  function Variable(params_hash){
    this.name = params_hash["name"] || "TMP";
    
  }
  Variable.prototype.init = function() {
   
  }

  function OutVariable(params_hash) {
    Variable.call(this, params_hash);
    this.view = params_hash["view"];
  }
  
  OutVariable.prototype = Object.create( Variable.prototype );
  OutVariable.prototype.constructor = OutVariable; 

  function InVariable(params_hash) {
    Variable.call(this, params_hash);
  }

  InVariable.prototype = Object.create( Variable.prototype );
  InVariable.prototype.constructor = InVariable;

  /**
   *  Define new systems by:
   *    Engine.new_system({
   *    
   *      calc: function (in_variables) { 
   *              return {out_variables}  
   *            }    
   *    
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
  }

  System.prototype.init = function() {

  }

}

