/**
  * sequ.js
  *
  * a self contained sequencer
  *
  * either connects to a globally defined context variable, 'ctx', or makes its own
	*
	* connects to global 'instruments' object
  *
  **/

class SEQU extends HTMLElement {
	constructor() {
		super();
		this.steps   = [];
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

		if (this.hasAttribute("steps")) {
			this.numSteps = this.getAttribute("steps");
		} else {
			// default to 8
			this.numSteps = 8;
		}
		
		if (this.hasAttribute("name")) {
			this.name = this.getAttribute("name");
		} else {
			this.name = "unnamed_sequencer";
		}

		if (window.instruments == undefined) {
			window.instruments = {};
			window.instruments[this.name] = this;
		} else {
			window.instruments[this.name] = this;
		}

		var xPos = 0;
		var stepWidth = this.width / this.numSteps;
		for (var i = 0; i < this.numSteps; i++) {
			let newDiv = document.createElement("div");	
			newDiv.style.position = "absolute";
			newDiv.style.top = 0;
			newDiv.style.left = xPos + "px";
			newDiv.style.height = this.height + "px";
			newDiv.style.width = stepWidth + "px";


			let newStep = new STEP(this.ctx);
			// this one maybe should go to a this.output or something??
			newStep.connect(this.ctx.destination);					
			this.steps.push(newStep);

			let newSlider = document.createElement("vertical-slider");
			this.sliders.push(newSlider);

			newDiv.appendChild(newSlider);
			this.shadow.appendChild(newDiv);
			// this needs to happen after connectedCallback in VSlider	
			newSlider.updateCallback = (v) => {
				newStep.frequency = midiToFrequency(v);
			};
			xPos += stepWidth;
		  /* 
 			 * ideas:
 			 * 	one method to connect all oscillators to something
 			 * 	and to connect to all oscillators	
 			 */ 	
		}
	}


	mapSteps(f) {
		if (typeof(f) != "function") {
			throw "trying to mapSteps but 'f' is of type " + typeof(f);
		}
		for (let i = 0; i < this.steps.length; i++) {
			f(this.steps[i]);	
		}	
	}

	set on(b) {
		this.playing = b;
	}
	
	get on() {
		return this.playing;
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

	start() {
		this.currIndex  = 0;
		this.on         = true;
		this.timer      = window.setInterval(() => {
			this.steps[this.currIndex].gateOn();
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

