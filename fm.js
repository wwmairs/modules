/**
  * fm.js
	*
	* an FM synthesis instrument
	* sub class of INST
	*
	* depends on modules:
	* 	inst.js
	*		modu.js
	*	and their dependencies
	*
	**/

class FM extends MONO {
	constructor(_ctx) {
		super(_ctx);
		this.modulator = new MODU(this.ctx);
		this.modulator.connect(this.frequencyParam);
	}

	connectToWindow() {
		window.modules = window.modules || {};
		window.modules["instruments"] = window.modules["instruments"] || [];
		this.name = "fm" + window.modules["instruments"].length;
		window.modules["instruments"].push({"name" : this.name, "module" : this});
	}
}
