/**
  * vstep.js
  *
  * a vertical sequencer step
  * contains its own oscillator, vca, and envelope
  * interprets relative vertical position of control dot as quantized pitch
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

class VStep {
	constructor(_ctx, _cont) {
		this.ctx  =  _ctx;
		this.cont = _cont;
		
		this.vco = new  VCO(_c);
		this.vca = new  VCA(_c);
		this.env = new ADSR(_c);

		// connecting things up	
		this.vco.connect(this.vca);
		this.env.connect(this.vca.amplitudeParam);
	  // vca needs to be connected to something
	  
		/* 
 		 * basic idea
 		 *
 		 * give the VStep a dom object it should fit inside (vanilla js shit)
 		 * from this we can determine width, height, add children and whatnot
 		 *
 		 * give it a context to create modules from, but leave it to be connected to
 		 * other things 
 		 *
 		 * 
 		 */

	  }
}
