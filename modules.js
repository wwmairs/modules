/**
  * utils.js
  *
  **/

var MIDI_FREQS = [];
// generate array of midi frequency values
// from http://subsynth.sourceforge.net/midinote2freq.html
const a = 440;
for (var i = 0; i <= 127; i++) {
	MIDI_FREQS[i] = (a / 32) * (Math.pow(2, ((i - 9) / 12)));
}	

function scale(x, lowIn, highIn, lowOut, highOut) {
	return (((highOut - lowOut) * (x - lowIn))/(highIn - lowIn)) + lowOut;
}

function midiToFrequency(n) {
	return MIDI_FREQS[n];
}


function assert(bool, msg) {
	if (!bool) {
		console.log(msg);
		throw new Error(msg);
	}
}

// a straightforward vco

class VCO {
    constructor(context) {
        this.context         = context;
        this.oscillator      = context.createOscillator();
        this.oscillator.type = 'sine';
        this.frequencyParam  = this.oscillator.frequency;
        this.frequency       = 146;
        this.oscillator.start(0);

        this.input  = this.oscillator;
        this.output = this.oscillator;
    }

    set waveForm(w) {
        // should assert that w is well-formed
        this.oscillator.type = w;
    }

    get waveForm() {
        return this.oscillator.type;
    }

    set frequency(f) {
        this.frequencyParam.setValueAtTime(f, this.context.currentTime);
    }

    get frequency() {
        return this.frequencyParam.value;
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

// a straightforward vca

class VCA {
    constructor(context) {
        this.context         = context;
        this.gain            = context.createGain();
        this.input           = this.gain;
        this.output          = this.gain;
        this.amplitudeParam  = this.gain.gain;
        this.amplitude       = 0;
    }

    set amplitude(a) {
        this.gain.gain.setValueAtTime(a, this.context.currentTime);
    }

    get amplitude() {
        return this.gain.gain.value;
    }


    connect(module) {
        if (module.hasOwnProperty('input')) {
            this.output.connect(module.input);
        } else {
            this.output.connect(module);
        }
    }

		disconnect() {
			this.output.disconnect();
		}
}

// a straightforward vcf

class VCF {
    constructor(context) {
        this.context        = context;
        this.biquadFilter   = context.createBiquadFilter();
        this.frequencyParam = this.biquadFilter.frequency;
        // initial values
        this.type           = "lowpass";
        this.frequency      = 0;
        this.Q              = .5;
				this.gain						= -200;
				this.env            = new ADSR(context);
				this.env.connect(this.biquadFilter.gain);

        this.input = this.biquadFilter;
        this.output = this.biquadFilter;

    }

    set frequency(f) {
        this.biquadFilter.frequency.setValueAtTime(f, this.context.currentTime);
    }

    get frequency() {
        return this.biquadFilter.frequency.value;
    }

    set type(t) {
        // assert that t is well-formed
        this.biquadFilter.type = t;
    }

    get type() {
        return this.biquadFilter.type;
    }

    set Q(q) {
        this.biquadFilter.Q.setValueAtTime(q, this.context.currentTime);
    }

    get Q() {
        return this.biquadFilter.Q.value;
    }

    set gain(g) {
        this.biquadFilter.gain.setValueAtTime(g, this.context.currentTime);
    }

    get gain() {
        return this.biquadFilter.gain.value;
    }

		gateOn(d = false) {
				this.env.gateOn(d);
		}

		set attack(v) {
			this.env.attack = v;
		}

		set decay(v) {
			this.env.decay = v;
		}

		set sustain(v) {
			console.log("setting filter sustain level to", v);
			this.env.sustain = v;
		}
		
		set release(v) {
			this.env.release = v;
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

// a straightforward adsr

class ADSR {
    constructor(context) {
        this.context = context;
        this.attackTime  = 0.05;
        this.decayTime   = 0.05;
        this.sustainValue = .5;
        this.releaseTime = 0.05;
				this.min = 0;
				this.max = 1;
    }

    set attack(a) {
        this.attackTime = a;
    }
    get attack() {
        return this.attackTime;
    }

    set decay(d) {
        this.decayTime = d;
    }
    get decay() {
        return this.decayTime;
    }

    set sustain(s) {
        this.sustainValue = s;
    }
    get sustain() {
        return this.sustainValue;
    }

    set release(r) {
        this.releaseTime = r;
    }
    get release() {
        return this.releaseTime;
    }

		set max(v) {
			this.maxValue = v;
		}

		get max() {
			return this.maxValue;
		}

		set min(v) {
			this.minValue = v;
		}
		
		get min() {
			return this.minValue;
		}

    gateOn(d = 0) {
      let now = this.context.currentTime;
      this.param.cancelScheduledValues(now);
      this.param.setValueAtTime(this.min, now);
      this.param.linearRampToValueAtTime(this.max, now + this.attack);
      // something different happens if you're holding a note
      this.param.linearRampToValueAtTime(this.sustainValue, now + this.attack + this.decay);
      this.param.linearRampToValueAtTime(this.min, now + this.attack + this.decay + d + this.release);
    }

		off() {
			let now = this.context.currentTime;
			this.param.setValueAtTime(this.min, now);
			this.param.cancelScheduledValues(now);
		}

    // unlike other modules, this one connects to an AudioParam, 
    // rather than either a module or an AudioNode
    connect(param) {
        this.param = param;
    }
}

/**
    * a modulator module that modulates
    * 
    * relies on vco.js and vca.js
    **/

class MODU {
    constructor(context) {
        this.context         = context;
        this.modulator       = new VCO(this.context);
        this.vca             = new VCA(this.context);
        this.frequencyParam  = this.modulator.frequencyParam;
        this.frequency       = 146;
        this.amplitude       = 100;
        this.waveForm        = "square";
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


/**
  * INST
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
	constructor(_ctx) {
		this.ctx = _ctx;
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

	connect(module) {
		throw new Error("method 'connect(module)' must be defined in a subclass of INST");
	}

}

class MONO extends INST {
	constructor(_ctx) {
		super(_ctx);
		this.vco    = new  VCO(this.ctx);
		this.vca    = new  VCA(this.ctx);
		this.env    = new ADSR(this.ctx);
		this.input 	= this.vco;
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

	gateOn(f = false, d = false) {
		if (f) {
			this.frequency = f;
		}
		this.env.gateOn(d);
	}

	off() {
		this.env.off();
	}

	connect(module) {
		if (module.hasOwnProperty('input')) {
			this.output.connect(module.input);
		} else {
			this.output.connect(module);
		}
	}
}

class POLY extends INST {
	constructor(_ctx) {
		super(_ctx);
		this.numVoices = 0;
		this.currVoice = 0;
		this.vcos 		 = [];
		this.vcas			 = [];
		this.envs			 = [];

		//this.vco    = new  VCO(this.ctx);
		//this.vca    = new  VCA(this.ctx);
		//this.env    = new ADSR(this.ctx);

		// these are kinda weird
		// what does it mean with many voices?
		this.input 	= this.vco;
		this.output = this.vca;

		// what happens to this?
		//this.frequencyParam = this.vco.frequencyParam;

		this.newOscillators(8);

		// connecting things up	
		//this.vco.connect(this.vca);
		//this.env.connect(this.vca.amplitudeParam);
	  // vca needs to be connected to something
	}

  mapVCOS(f) {
    if (typeof(f) != "function") {
      throw "trying to mapVCOS but 'f' is of type " + typeof(f);
    }
    for (let i = 0; i < this.vcos.length; i++) {
      f(this.vcos[i]); 
    } 
  }

  mapVCAS(f) {
    if (typeof(f) != "function") {
      throw "trying to mapVCAS but 'f' is of type " + typeof(f);
    }
    for (let i = 0; i < this.vcas.length; i++) {
      f(this.vcas[i]); 
    } 
  }

  mapENVS(f) {
    if (typeof(f) != "function") {
      throw "trying to mapENVS but 'f' is of type " + typeof(f);
    }
    for (let i = 0; i < this.envs.length; i++) {
      f(this.envs[i]); 
    } 
  }

	newOscillators(num) {
		this.numVoices += num;
		for (var i = 0; i < num; i++) {
			this.newOscillator();
		}
	}

	newOscillator() {
		let newVCO = new  VCO(this.ctx);
		let newVCA = new  VCA(this.ctx);
		let newENV = new ADSR(this.ctx);
		newVCO.connect(newVCA);
		newENV.connect(newVCA.amplitudeParam);
		this.vcos.push(newVCO);
		this.vcas.push(newVCA);
		this.envs.push(newENV);
	}

	// set freq of current voice
	set frequency(f) {
		this.vcos[this.currVoice].frequency = f;
	}

	set waveForm(w) {
		this.mapVCOS( (vco) => {
			vco.waveForm = w;
		});
	}

	gateOn(f = false, d = false) {
		if (f) {
			this.frequency = f;
		}
		this.envs[this.currVoice].gateOn(d);
		this.currVoice = (this.currVoice + 1) % this.numVoices;
	}

	off() {
		this.mapENVS( (env) => {
			env.off();
		});
	}

	connect(module) {
		if (module.hasOwnProperty('input')) {
			for (var i = 0; i < this.vcas.length; i++) {
				this.vcas[i].connect(module.input);
			}
		} else {
			for (var i = 0; i < this.vcas.length; i++) {
				this.vcas[i].connect(module);
			}
		}
	}

	disconnect() {
		this.mapVCAS( (vca) => {
			vca.disconnect();	
		});
	}
}

/**
  * fm.js
  *
  * an FM synthesis instrument
  * sub class of INST
  *
  * depends on modules:
  *   inst.js
  *       modu.js
  *   and their dependencies
  *
  **/

class FM extends POLY {
  constructor(_ctx) {
    super(_ctx);
		this.modFactor = 4;
		this.filterEnv = false;
		this.constantFilterFreqNode.offset.value = 440;
  }

	newOscillators(n) {
		this.mods = []
		this.vcfs = [];
		this.constantFilterFreqNode = this.ctx.createConstantSource();
		super.newOscillators(n);
		this.constantFilterFreqNode.start();
	}

	newOscillator() {
		let newVCO = new  VCO(this.ctx);
		let newVCA = new  VCA(this.ctx);
		let newENV = new ADSR(this.ctx);
		let newVCF = new  VCF(this.ctx);
		let newMOD = new MODU(this.ctx);
		newVCO.connect(newVCF);
		newENV.connect(newVCA.amplitudeParam);
		newVCF.connect(newVCA);
		newMOD.connect(newVCO.frequencyParam);
		newVCF.env.max = -200;
		this.constantFilterFreqNode.connect(newVCF.frequencyParam);
		this.vcos.push(newVCO);
		this.vcas.push(newVCA);
		this.envs.push(newENV);
		this.vcfs.push(newVCF);
		this.mods.push(newMOD);
	}

	gateOn(f = false, d = false) {
		if (f) {
			this.mods[this.currVoice].frequency = f * this.modFactor;
			this.frequency = f;
		}
		if (this.filterEnv) {
			this.vcfs[this.currVoice].gateOn(d)
		}
		// does this work?
		// I think so 
		// TODO: test new poly FM a lot
		super.gateOn(f, d);
	}

	set modWaveform(w) {
		this.modulator.waveForm = w;	
	}

	get modFactor() {
		return this.mf;
	}

	set modFactor(f) {
		this.mf = f;
	}

	set ampAttack(a) {
		this.mapENVS((env) => {
			env.attack = a;
		});
	}

	set ampDecay(d) {
		this.mapENVS((env) => {
			env.decay = d;
		});
	}

	set ampSustain(s) {
		this.mapENVS((env) => {
			env.sustain = s;
		});
	}

	set ampRelease(r) {
		this.mapENVS((env) => {
			env.release = r;
		});
	}

	set filterFreq(f) {
		console.log('setting filter freq to',f);
		this.constantFilterFreqNode.offset.value = f;
	}

	set filterAttack(a) {
		this.vcfs.map((vcf) => {
			vcf.attack = a;
		});
	}

	set filterDecay(d) {
		this.vcfs.map((vcf) => {
			vcf.decay = d;
		});
	}

	set filterSustain(s) {
		this.vcfs.map((vcf) => {
			vcf.sustain = s;
		});
	}

	set filterRelease(r) {
		this.vcfs.map((vcf) => {
			vcf.release = r;
		});
	}

	connect(module) {
		if (module.hasOwnProperty('input')) {
			this.vcas.map((vca) => {
				vca.connect(module.input);
			});
		} else {
			this.vcas.map((vca) => {
				vca.connect(module);
			});
		}
	}
}


/**
  * instrument_handler.js
  *
  * holds on to instruments
  * receives and sends messages to communicate with other modules
  *
  **/

class Handler {
  constructor() {
    this.ctx = new (self.AudioContext || self.webkitAudioContext);
    this.instruments = [];
  }

  newFM() {
    let newFM = new FM(this.ctx);
		newFM.connect(this.ctx.destination);
    let name = "FM" + this.instruments.length;
    this.instruments.push({"name" : name, "inst" : newFM});
    return name;
  }

  noteon(name, frequency = false, duration = false) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for noteon");
    i.gateOn(frequency, duration);
  }

	mod(name, f) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for mod");
		i.modFactor = f;
	}

	waveForm(name, w) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for waveForm");
		i.waveForm = w;
	}

	modWaveForm(name, w) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for modWaveForm");
		i.modWaveForm = w;
	}

	// handling amplitude adsr
	ampA(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for ampA");
		i.ampAttack = v;
	}

	ampD(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for ampD");
		i.ampDecay = v;
	}

	ampS(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for ampS");
		console.log("handler setting sustain to", v);
		i.ampSustain = v;
	}

	ampR(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for ampR");
		i.ampRelease = v;
	}

	// handling filter adsr
	filterA(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for filterA");
		i.filterAttack = v;
	}

	filterD(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for filterD");
		i.filterDecay = v;
	}

	filterS(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for filterS");
		i.filterSustain = v;
	}

  filterR(name, v) {
    let i = this.find(name);
    assert(i != false, "couldn't find inst for filterR");
		i.filterRelease = v;
	}

	off(name) {
		let i = this.find(name);
    assert(i != false, "couldn't find inst for off");
		i.off();
	}

  // returns the 'inst'
  find(name) {
    let found = false;
    this.mapInstruments((i) => {
      if (i.name == name) {
        found = i.inst;
      }
    });
    return found;
  }

  mapInstruments(f) {
    for (var i = 0; i < this.instruments.length; i++) {
      f(this.instruments[i]); 
    }
  }
}


/**
  * HTML elements
  **/

/**
  * hslider.js
  *
  * a horizontal dom object slider
  *
  **/

class HSlider extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
		this.min = 48;
		this.max = 72;
  }

  connectedCallback() {
    this.cont   = this.parentNode;
    this.height = this.cont.clientHeight;
    this.width  = this.cont.clientWidth;
    this.sliderHeight = this.height / 8;

    // def need a better color scheme, or maybe some programmatic way
    // to set colors
    this.style.position   = "absolute";
		let lineDiv = document.createElement("div");
		lineDiv.style.width = "100%";
		lineDiv.style.height = "50%";
		lineDiv.style.borderBottom = "1px solid #a8a8a8";
		this.shadow.appendChild(lineDiv);

    // grab target, if specified, default is to give midi to freq
    if (this.hasAttribute("targetf")) {
      let target_string = this.getAttribute("targetf");
      this.updateCallback = (v) => {
        let t = eval(target_string);
        t.frequency = midiToFrequency(Math.round(v));
      };
    } else {
      this.updateCallback = (v) => v;
    }
    // make a circular element
    this.slider = document.createElement("div");
    this.slider.style.position = "absolute";
    this.slider.style.height = this.sliderHeight + "px";
    this.slider.style.width = this.sliderHeight + "px";
		this.slider.style.borderRadius = this.sliderHeight + "px";
    this.slider.style.left = this.width / 2 - this.sliderHeight / 2 + "px";;
    this.slider.style.top = (this.height / 2) - this.sliderHeight / 2 + "px";
    this.slider.style.background = "#3A83B0";

    // make this shit draggable
    // vars for calculating distance traveled
    var pos1 = 0, pos2 = 0, that = this;
    function dragMouseDown(e) {
      e = e || window.event;
      pos2 = e.clientX; 
			console.log("starting pos2", pos2);
      document.onmouseup = endDrag;
      document.onmousemove = dragSlider;
    }

    function dragSlider(e) {
      e = e || window.event;
      pos1 = pos2 - e.clientX;
      pos2 = e.clientX;
      let newPos = that.slider.offsetLeft - pos1;

      // make sure it's not off the ends
      if ((newPos <= that.offsetLeft + that.offsetWidth - that.sliderHeight / 2) &&
          (newPos >= that.offsetLeft)) {
        that.slider.style.left = newPos + "px";
				// continuous updating
        //that.updateCallback(that.value);
      }
    }

    function endDrag() {
			// updating only on mouse up
			//console.log(that.updateCallback);
      that.updateCallback(that.value);
      document.onmouseup   = null;
      document.onmousemove = null;
    }
    this.slider.onmousedown = dragMouseDown;

    this.shadow.appendChild(this.slider);
  }

  set height(h) {
    this._h = h;
    this.style.height = h + "px";
  }

  get height() {
    return this._h;
  }

  get width() {
    return this._w;
  }

  set width(w) {
    this._w = w;
    this.style.width = w + "px";
  }

	set onUpdate(f) {
		this.updateCallback = f;
	}

	get value() {
    return scale(this.slider.offsetLeft, this.offsetLeft,
                 this.offsetLeft + this.offsetWidth - this.sliderHeight,
                 this.min, this.max);
	}
}

customElements.define('horizontal-slider', HSlider);

/**
  * vslider.js
  *
  * a vertical dom object slider
  *
  **/

class VSlider extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({mode: "open"});
		this.min = 48;
		this.max = 72;
  }

  connectedCallback() {
    this.cont   = this.parentNode;
    this.height = this.cont.clientHeight;
    this.width  = this.cont.clientWidth;
    this.sliderHeight = this.width / 8;

    // def need a better color scheme, or maybe some programmatic way
    // to set colors
    this.style.position   = "absolute";
		let lineDiv = document.createElement("div");
		lineDiv.style.width = "50%";
		lineDiv.style.height = "100%";
		lineDiv.style.borderRight = "1px solid #a8a8a8";
		this.shadow.appendChild(lineDiv);

    // grab target, if specified, default is to give midi to freq
    if (this.hasAttribute("targetf")) {
      let target_string = this.getAttribute("targetf");
      this.updateCallback = (v) => {
        let t = eval(target_string);
        t.frequency = midiToFrequency(Math.round(v));
      };
    } else {
      this.updateCallback = (v) => v;
    }
    // make a circular element
    this.slider = document.createElement("div");
    this.slider.style.position = "absolute";
    this.slider.style.height = this.sliderHeight + "px";
    this.slider.style.width = this.sliderHeight + "px";
		this.slider.style.borderRadius = this.sliderHeight + "px";
    this.slider.style.left = this.width / 2 - this.sliderHeight / 2 + "px";;
    this.slider.style.top = (this.height / 2) - this.sliderHeight / 2 + "px";
    this.slider.style.background = "#3A83B0";

    // make this shit draggable
    // vars for calculating distance traveled
    var pos1 = 0, pos2 = 0, that = this;
    function dragMouseDown(e) {
      e = e || window.event;
      pos2 = e.clientY; 
      document.onmouseup = endDrag;
      document.onmousemove = dragSlider;
    }

    function dragSlider(e) {
      e = e || window.event;
      pos1 = pos2 - e.clientY;
      pos2 = e.clientY;
      let newPos = that.slider.offsetTop - pos1;

      // make sure it's not off the ends
      if ((newPos <= that.offsetTop + that.offsetHeight - 10) &&
          (newPos >= that.offsetTop)) {
        that.slider.style.top = newPos + "px";
				// continuous updating
        //that.updateCallback(that.value);
      }
    }

    function endDrag() {
			// updating only on mouse up
			//console.log(that.updateCallback);
      that.updateCallback(that.value);
      document.onmouseup   = null;
      document.onmousemove = null;
    }
    this.slider.onmousedown = dragMouseDown;

    this.shadow.appendChild(this.slider);
  }

  set height(h) {
    this._h = h;
    this.style.height = h + "px";
  }

  get height() {
    return this._h;
  }

  get width() {
    return this._w;
  }

  set width(w) {
    this._w = w;
    this.style.width = w + "px";
  }

	set onUpdate(f) {
		this.updateCallback = f;
	}

	get value() {
    return scale(this.slider.offsetTop, this.offsetTop,
                 this.offsetTop + this.offsetHeight - this.sliderHeight,
                 this.min, this.max);
	}
}

customElements.define('vertical-slider', VSlider);

/**
	* VSliders
	* 
	* a bank of vertical sliders
	* good for an adsr
	* or other things
	**/


class VSliders extends HTMLElement {
	constructor() {
		super();
		this.sliders = [];
		this.numSliders = 4;
		this.shadow = this.attachShadow({mode: "open"});
	}

	connectedCallback() {
		this.cont   = this.parentNode;
		this.height = this.cont.clientHeight;
		this.width  = this.cont.clientWidth;
    // creating sliders and adding them to shadow
    var xPos = 0;
    var stepWidth = this.width / this.numSliders;
    for (var i = 0; i < this.numSliders; i++) {
      let newDiv = document.createElement("div"); 
      newDiv.style.position = "absolute";
      newDiv.style.top = 0;
      newDiv.style.left = xPos + "px";
      newDiv.style.height = this.height + "px";
      newDiv.style.width = stepWidth + "px";

      let newSlider = document.createElement("vertical-slider");
      this.sliders.push(newSlider);

      newDiv.appendChild(newSlider);
      this.shadow.appendChild(newDiv);
      // this needs to happen after connectedCallback in VSlider  
      xPos += stepWidth;
    }
	}

  mapSliders(f) {
    if (typeof(f) != "function") {
      throw "trying to mapSteps but 'f' is of type " + typeof(f);
    }
    for (let i = 0; i < this.sliders.length; i++) {
      f(this.sliders[i]); 
    } 
  }

}

customElements.define('vertical-slide-bank', VSliders);

class Controller extends HTMLElement {
}

/**
  * sequ.js
  *
  * a sequencer with steps
  *
  * connects to global 'modules' object
  *
  **/

class SEQU extends HTMLElement {
  constructor() {
    super();
    this.sliders = [];
    this.shadow  = this.attachShadow({mode: "open"});
    this.on      = false;
  }

  connectedCallback() {
		this.currIndex = 0;
    this.duration  = .25;
    this.stepTime  = 250;
    this.cont      = this.parentNode;
    this.height    = this.cont.clientHeight;
    this.width     = this.cont.clientWidth;
  
    // make steps and hook em up
    if (this.hasAttribute("steps")) {
      this.numSteps = this.getAttribute("steps");
    } else {
      // default to 8
      this.numSteps = 8;
    }
    
    // creating sliders and adding them to shadow
    var xPos = this.width / 10;
    var stepWidth = (this.width * (9/10) ) / this.numSteps;
    for (var i = 0; i < this.numSteps; i++) {
      let newDiv = document.createElement("div"); 
      newDiv.style.position = "absolute";
      newDiv.style.top = this.height / 20 + "px";
      newDiv.style.left = xPos + "px";
      newDiv.style.height = this.height * (18/20) + "px";
      newDiv.style.width = stepWidth + "px";

      let newSlider = document.createElement("vertical-slider");
      this.sliders.push(newSlider);

      newDiv.appendChild(newSlider);
      this.shadow.appendChild(newDiv);
      // this needs to happen after connectedCallback in VSlider  
      xPos += stepWidth;
    }

		// container for left side controls
		this.side = document.createElement("div");
		this.side.style.position = "absolute";
		this.side.style.top = 0;
		this.side.style.left = 0;
		this.side.style.width = this.width / 10 + "px";

		// create button for on / off
		let newDiv = document.createElement("button");
		newDiv.innerHTML = "playpause";
		newDiv.style.display = "block";
		newDiv.onclick = () => {this.toggle()};
		this.side.appendChild(newDiv);
		// button for step
		newDiv = document.createElement("button");
		newDiv.innerHTML = "step";
		newDiv.style.display = "block";
		newDiv.onclick = () => {this.step()};
		this.side.appendChild(newDiv);

		// sliders for duration, stepTime
		newDiv = document.createElement("input");
		newDiv.type = "number";
		newDiv.value = 250;
		newDiv.onchange = (e) => {console.log('duration:', e.target.value / 1000); this.duration = e.target.value / 1000};
		this.side.appendChild(newDiv);
		let newLabel = document.createElement("span");
		newLabel.innerHTML = "duration";
		this.side.appendChild(newLabel);

		newDiv = document.createElement("input");
		newDiv.type = "number";
		newDiv.value = 250;
		newDiv.onchange = (e) => {console.log('stepTime:', e.target.value); this.stepTime = e.target.value};
		this.side.appendChild(newDiv);
		newLabel = document.createElement("span");
		newLabel.innerHTML = "step time";
		newLabel.style.display = "block";
		this.side.appendChild(newLabel);

		// create select
		this.sel = document.createElement("select");
		this.sel.onchange = (o) => {this.targetName = o.target.value;};
		this.side.appendChild(this.sel);


		this.shadow.appendChild(this.side);
  }


  mapSliders(f) {
    if (typeof(f) != "function") {
      throw "trying to mapSteps but 'f' is of type " + typeof(f);
    }
    for (let i = 0; i < this.sliders.length; i++) {
      f(this.sliders[i]); 
    } 
  }

	set duration(d) {
		this.d = d;
		if (this.on) {
			this.start();
		}
	}

	get duration() {
		return this.d;
	}

  set stepTime(t) {
    this.st = t;
    if (this.on) {
      this.start();
    }
  }
  
  get stepTime() {
    return this.st;
  }

  toggle() {
    this.on ? this.stop() : this.start();
  }

	step() {
		if (this.targetName == "disconnect") return;
		if (this.on) {
			this.stop();
		}
		h.noteon(this.targetName,
						 midiToFrequency(Math.round(this.sliders[this.currIndex].value)),
						 this.duration);
		this.currIndex++;
		this.currIndex %= this.numSteps;
	}

	restart() {
    this.currIndex = 0;
		this.start();
	}

  start() {
		if (this.targetName == "disconnect") return;
    window.clearInterval(this.timer);
		assert(this.targetName != undefined, "trying to start sequencer with no target");
    this.on         = true;
    this.timer      = window.setInterval(() => {
			// send noteon to handler
			h.noteon(this.targetName,
							 midiToFrequency(Math.round(this.sliders[this.currIndex].value)),
							 this.duration);
      this.currIndex++;
      this.currIndex %= this.numSteps;
    }, this.stepTime);
  
  }

  stop() {
		assert(this.targetName != undefined, "trying to stop sequencer with no target");
    this.on = false;
    window.clearInterval(this.timer);
  }

	displayInstrument(name) {
		if (this.sel.children.length == 0) {
			let opt = document.createElement("option");
			opt.innerHTML = "disconnect";
			opt.value = "disconnect";
			this.sel.appendChild(opt);
			this.targetName = "disconnect";
		}
		let opt = document.createElement("option");
		opt.innerHTML = name;
		opt.value = name;
		this.sel.appendChild(opt);
	}

	removeInstrument(name) {
	}
}

customElements.define('step-sequence', SEQU);

/**
	* FMELEM
	*
	* a graphical interface for an FM inst
	*
	*/
class FMELEM extends HTMLElement {
  constructor() {
    super();
    this.shadow  = this.attachShadow({mode: "open"});
    this.on      = false;
		this.h			 = h;
		this.name    = h.newFM();
  }

  connectedCallback() {
    this.cont      = this.parentNode;
    this.height    = this.cont.clientHeight;
    this.width     = this.cont.clientWidth;
	
		this.leftSide = document.createElement("div");
		this.leftSide.style.position = "absolute";
		this.leftSide.style.left = "0";
		this.leftSide.style.width = "30vw";
		this.leftSide.style.height = "50vh";
		this.rightSide = document.createElement("div");
		this.rightSide.style.position = "absolute";
		this.rightSide.style.left = "70vw";
		this.rightSide.style.width = "30vw";
		this.rightSide.style.height = "50vh";

		// name and buttons and things I suppose
		let newDiv = document.createElement("div");
		newDiv.style.position = "absolute";
		newDiv.style.left = "50%";
		newDiv.style.transform = "translateX(-50%)";
		newDiv.innerHTML = "FM";
		this.shadow.appendChild(newDiv);

		// selects for waveforms of vcos and mod
		newDiv = document.createElement("div");
		this.waveSelect = document.createElement("select");
		["sine", "square", "sawtooth", "triangle"].map( (type) => {
			let opt = document.createElement("option");
			opt.innerHTML = type;
			opt.value = type;
			this.waveSelect.appendChild(opt);
		});
		this.waveSelect.onchange = (e) => {
			this.h.waveForm(this.name, e.target.value);
		}
		newDiv.appendChild(this.waveSelect);
		this.leftSide.appendChild(newDiv);

		newDiv = document.createElement("div");
		this.modWaveSelect = document.createElement("select");
		["sine", "square", "sawtooth", "triangle"].map( (type) => {
			let opt = document.createElement("option");
			opt.innerHTML = type;
			opt.value = type;
			this.modWaveSelect.appendChild(opt);
		});
		this.modWaveSelect.onchange = (e) => {
			this.h.modWaveForm(this.name, e.target.value);
		}
		newDiv.appendChild(this.modWaveSelect);
		this.leftSide.appendChild(newDiv);

		// slider for modulating
		newDiv = document.createElement("input");
		newDiv.type = "number";
		newDiv.value = 4;
		newDiv.onchange = (e) => {console.log('mod value:', e.target.value); this.h.mod(this.name, e.target.value);};
		this.leftSide.appendChild(newDiv);
		let newLabel = document.createElement("span");
		newLabel.innerHTML = "mod ratio";
		this.leftSide.appendChild(newLabel);

		this.shadow.appendChild(this.leftSide);

		// oscilloscope
		newDiv = document.createElement("div");
		newDiv.style.position = "absolute";
		newDiv.style.left = "30vw";	
		newDiv.style.top = "0";
		newDiv.style.width = "40vw";
		newDiv.style.height = "50vh";
		this.oscilloscope = document.createElement("o-scope");
		newDiv.appendChild(this.oscilloscope);
		this.shadow.appendChild(newDiv);
		// connect o-scope
		this.oscilloscope.connectTo(this.h.find(this.name));

		this.shadow.appendChild(this.rightSide);

		// select for filter
		this.filterSelect = document.createElement("select");
		["lowpass", "highpass", "bandpass", "notch", 
		 "lowshelf", "highshelf", "peaking", "allpass"].map( (type) => {
			let opt = document.createElement("option");
			opt.innerHTML = type;
			opt.value = type;
			this.filterSelect.appendChild(opt);
		});
		this.filterSelect.onchange = (e) => {
			let fm = this.h.find(this.name);
			let type = e.target.value;
			if (["lowshelf", "highshelf", "peaking"].includes(type)) {
				fm.filterEnv = true;	
				// display filter adsr sliders
			} else {
				fm.filterEnv = false;
				// grey out filter adsr sliders
			}
			fm.vcfs.map((filter) => {
				filter.type = type;
			});
		}
		this.rightSide.appendChild(this.filterSelect);

		// filter frequency slide
		newDiv = document.createElement("div");
		newDiv.style.width = "10vw";
		newDiv.style.height = "50px";

		this.filterFreqSlider = document.createElement("horizontal-slider");
		this.filterFreqSlider.min = 0;
		this.filterFreqSlider.max = 1500;
		newDiv.appendChild(this.filterFreqSlider);
		this.rightSide.appendChild(newDiv);
		this.filterFreqSlider.onUpdate = (v) => {this.h.find(this.name).filterFreq = v};

		// controls for filter adsr
		newLabel = document.createElement("span");
		newLabel.innerHTML = "filter envelope";
		this.rightSide.appendChild(newLabel);
		newDiv = document.createElement("div");
		newDiv.style.position = "relative";
		newDiv.style.left = "0";
		newDiv.style.width = "30vw";
		newDiv.style.height = "16vh";
		this.filterADSRbank = document.createElement("vertical-slide-bank");
		newDiv.appendChild(this.filterADSRbank);
		this.rightSide.appendChild(newDiv);
		this.filterADSRbank.mapSliders((s) => {
			s.min = 0;
			s.max = 1;
		});
		// attack
		this.filterADSRbank.sliders[0].onUpdate = (v) => {h.filterA(this.name, v)};
		// decay
		this.filterADSRbank.sliders[1].onUpdate = (v) => {h.filterD(this.name, v)};
		// sustain
		this.filterADSRbank.sliders[2].min = 0;
		this.filterADSRbank.sliders[2].max = -200;
		this.filterADSRbank.sliders[2].onUpdate = (v) => {h.filterS(this.name, v)};
		// release
		this.filterADSRbank.sliders[3].onUpdate = (v) => {h.filterR(this.name, v)};

		

		// controls for amplitude adsr
		newLabel = document.createElement("span");
		newLabel.innerHTML = "carrier amplitude envelope";
		this.rightSide.appendChild(newLabel);
		newDiv = document.createElement("div");
		newDiv.style.position = "relative";
		newDiv.style.left = "0";
		newDiv.style.width = "30vw";
		newDiv.style.height = "16vh";
		this.ADSRbank = document.createElement("vertical-slide-bank");
		newDiv.appendChild(this.ADSRbank);
		this.rightSide.appendChild(newDiv);
		this.ADSRbank.mapSliders((s) => {
			s.min = 0;
			s.max = 1;
		});
		// attack
		this.ADSRbank.sliders[0].onUpdate = (v) => {h.ampA(this.name, v)};
		// decay
		this.ADSRbank.sliders[1].onUpdate = (v) => {h.ampD(this.name, v)};
		// sustain
		this.ADSRbank.sliders[2].onUpdate = (v) => {h.ampS(this.name, v)};
		// release
		this.ADSRbank.sliders[3].onUpdate = (v) => {h.ampR(this.name, v)};

		// tell all sequencers to display name
		let controllers = document.getElementsByClassName("controller");
		for (var i = 0; i < controllers.length; i ++) {
			controllers[i].displayInstrument(this.name);
		}

	}
}


customElements.define('fm-elem', FMELEM);


/**
	* OSC
	*
	* an oscilloscope
	* cleverness from:
	* https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
	*
	**/
  
class OSC extends HTMLElement {
  constructor() {
    super();
    this.shadow   = this.attachShadow({mode: "open"});
		this.h			  = h;
		this.analyser = h.ctx.createAnalyser();
		this.analyser.fftSize = 2048;
		this.bufferLength = this.analyser.frequencyBinCount;
		this.dataArray = new Uint8Array(this.bufferLength);
  }

  connectedCallback() {
    this.cont      = this.parentNode;
    this.height    = this.cont.clientHeight;
    this.width     = this.cont.clientWidth;
		this.canvas = document.createElement("canvas");
		this.canvas.setAttribute("height", this.height);
		this.canvas.setAttribute("width", this.width);
		this.shadow.appendChild(this.canvas);
		this.canvasCtx = this.canvas.getContext('2d');
		this.canvasCtx.clearRect(0, 0, this.width, this.height);

		this.draw();
	}

	draw() {
		// I am very curious about the scoping issues that cause this
		// this.drawVisual = requestAnimationFrame(this.draw) works once and then
		// 'this' is undefined
		// this encapsulates the 'this'
		this.drawVisual = requestAnimationFrame(() => {this.draw.call(this)});
		this.analyser.getByteTimeDomainData(this.dataArray);
		this.canvasCtx.fillStyle = '#238C53';
		this.canvasCtx.fillRect(0, 0, this.width, this.height);
		this.canvasCtx.lineWidth = 5;
		this.canvasCtx.strokeStyle = '#FCAB56';
		this.canvasCtx.beginPath();
		var sliceWidth = this.width * 1.0 / this.bufferLength;
		var x = 0;
		for(var i = 0; i < this.bufferLength; i++) {
		   
			var v = this.dataArray[i] / 128.0;
			var y = v * this.height/2;

			if(i === 0) {
				this.canvasCtx.moveTo(x, y);
			} else {
				this.canvasCtx.lineTo(x, y);
			}

			x += sliceWidth;
		}
		this.canvasCtx.lineTo(this.width, this.height/2);
		this.canvasCtx.stroke();
	}

	connectTo(node) {
		node.connect(this.analyser);	
	}

}

customElements.define('o-scope', OSC);
		
