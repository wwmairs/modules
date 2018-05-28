/**
  * step.js
  *
  * a sequencer step
  * contains its own oscillator, vca, and envelope
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

class STEP {
	constructor(_ctx, _cont) {
		this.ctx  =  _ctx;
		this.cont = _cont;
		
		this.vco = new  VCO(this.ctx);
		this.vca = new  VCA(this.ctx);
		this.env = new ADSR(this.ctx);
		this.frequencyParam = this.vco.frequencyParam;
		this.duration = 250;

		// connecting things up	
		this.vco.connect(this.vca);
		this.env.connect(this.vca.amplitudeParam);
	  // vca needs to be connected to something

	  }

	gateOn() {
		console.log('gate');
	}
}
