/**
  * sequ.js
  *
  * a sequencer with steps
  *
  * either connects to a globally defined context variable, 'ctx', or makes its own
	*
	* connects to global 'instruments' object
  *
  **/

class SEQU extends HTMLElement {
	constructor() {
		super();
		this.sliders = [];
		this.shadow  = this.attachShadow({mode: "open"});
		this.on 		 = false;
		if (ctx == undefined) {
			this.ctx = new (window.AudioContext || window.webkitAudioContext);
		} else {
			this.ctx = ctx;
		}
	}

	connectedCallback() {
		this.durration = 100;
		this.stepTime  = 250;
		this.cont      = this.parentNode;
		this.height    = this.cont.clientHeight;
		this.width     = this.cont.clientWidth;
		this.modulator = new MODU(this.ctx);

		// name sequencer
		if (this.hasAttribute("name")) {
			this.name = this.getAttribute("name");
		} else {
			this.name = "unnamed_sequencer";
		}
		// add sequencer to window instruments
		if (window.instruments == undefined) {
			window.instruments = {};
			window.instruments[this.name] = this;
		} else {
			window.instruments[this.name] = this;
		}
		// make steps and hook em up
		if (this.hasAttribute("steps")) {
			this.numSteps = this.getAttribute("steps");
		} else {
			// default to 8
			this.numSteps = 8;
		}
		
		// creating sliders and adding them to shadow
		var xPos = 0;
		var stepWidth = this.width / this.numSteps;
		for (var i = 0; i < this.numSteps; i++) {
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

	set duration(d) {
	}

	get duration() {
	}

	set stepTime(t) {
		this.st = t;
		if (this.on) {
			this.stop();
			this.start();
		}
	}
	
	get stepTime() {
		return this.st;
	}

	connect(instrument) {
		// this is an interesting challenge
		// maybe inspect instrument to see the number of voices
		//		=> way better idea, abstract voices away from the sequencer!!!
		// hold on to instrument, to access frequency and gateOn
	}

	start() {
		this.currIndex  = 0;
		this.on         = true;
		this.timer      = window.setInterval(() => {
			// this is the old way it workds
			// this.steps[this.currIndex].gateOn();
			// 
			// figure out where the gateOn needs to be sent!!
			// there maybe could be a monophonic instrument, in which case:
			// 	- frequency gets updated
			//  - gate on sent to instrument
			// there could be a polyphonoic instrument, in which case:
			//	- figure out how to cycle through available oscillators

			//  WAY BETTER IDEA: abstract voices from sequencer
			//	=> the instrument offers a gateOn method (and maybe even one with a frequency included)
			//		 and it handles the rest
			this.currIndex++;
			this.currIndex %= this.numSteps;
		}, this.stepTime);
	
	}

	stop() {
		this.on = false;
		window.clearInterval(this.timer);
	}
}

customElements.define('step-sequence', SEQU);

