/**
  * inst.js
  *
  * an instrument super class
	* 
	* and a monophonic sub class
  * contains its own oscillator, vca, and envelope
	* connects to window.ctx, if it exists, or else initializes it
  *
  * connects to a context
  * oscillator can be connected to for FM
  * envelope can be connected to for gate
  *
  * depends on modules:
  * 	vco.js
  * 	vca.js
  * 	adsr.js
  **/



class INST {
	constructor() {
		ctx = ctx || new (window.AudioContext || window.webkitAudioContext);
		this.ctx = ctx;
		this.connectToWindow();
	 }
	
	set frequency(f) {
		throw new Error("setter 'frequency' must be defined in a subclass of INST");
	}

	gateOn() {
		throw new Error("method 'gateOn()' must be defined in a subclass of INST");
	}

	gateOn(f) {
		throw new Error("method 'gateOn(f)' must be defined in a subclass of INST");
	}

	gateOn(f, d) {
		throw new Error("method 'gateOn(f, d)' must be defined in a subclass of INST");
	}

	connectToWindow() {
		// add unnamed INST to window modules
		window.modules = window.modules || {};
		window.modules["instruments"] = window.modules["instruments"] || [];
		// come up with unique name for the instrument
		this.name = "instrument" + window.modules["instruments"].length;
		window.modules["instruments"].push({"name" : this.name, "module" : this});
	}
	
	connect(module) {
		throw new Error("method 'connect(module)' must be defined in a subclass of INST");
	}

}

class MONO extends INST {
	constructor() {
		super();
		this.vco    = new  VCO(this.ctx);
		this.vca    = new  VCA(this.ctx);
		this.env    = new ADSR(this.ctx);
		this.input 	= this.vca;
		this.output = this.vca;
		this.frequencyParam = this.vco.frequencyParam;

		// connecting things up	
		this.vco.connect(this.vca);
		this.env.connect(this.vca.amplitudeParam);
	  // vca needs to be connected to something
	}

	set frequency(f) {
		this.vco.frequency = f;
	}

	gateOn() {
		this.env.gateOn();
	}

	gateOn(f) {
		this.frequency = f;
		this.env.gateOn();
	}

	gateOn(f, d) {
		this.frequency = f;
		this.env.gateOn(d);
	}

	connect(module) {
		if (module.hasOwnProperty('input')) {
			this.output.connect(module.input);
		} else {
			this.output.connect(module);
		}
	}
}
