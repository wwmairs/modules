/**
	* a modulator module that modulates
	* 
	* relies on vco.js and vca.js
	**/

class MODULATOR {
    constructor(context) {
        this.context         = context;
        this.modulator       = new VCO(this.context);
				this.vca						 = new VCA(this.context);
        this.frequencyParam  = this.modulator.frequencyParam;
        this.frequency       = 146;
				this.amplitude			 = 100;
				this.waveForm				 = "square";
			  this.modulator.connect(this.vca);	

        this.input  = this.modulator;
        this.output = this.vca;
    }

    set waveForm(w) {
        // should assert that w is well-formed
        this.modulator.waveForm = w;
    }

    get waveForm() {
        return this.modulator.waveForm;
    }

		set amplitude(a) {
				this.vca.amplitude = a;
		}
	
		get amplitude() {
				return this.vca.amplitude;
		}

    set frequency(f) {
				this.modulator.frequency = f;
    }

    get frequency() {
        return this.modulator.frequency;
    }

    // this can connect to either another module, or an AudioNode
    // I wonder how to let it connect to an AudioParam as well
    connect(module) {
        if (module.hasOwnProperty('input')) {
            this.output.connect(module.input);
        } else {
            this.output.connect(module);
        }
    }
}
