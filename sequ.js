/**
  * sequ.js
  *
  * a self contained sequencer
  *
  **/

class SEQU extends HTMLElement {
	constructor() {
		super();
		this.shadow = this.attachShadow({mode: "open"});
	}

	connectedCallback() {
		this.cont   = this.parentNode;
		this.height = this.cont.clientHeight;
		this.width  = this.cont.clientWidth;

		if (this.hasAttribute("steps")) {
			this.numSteps = this.getAttribute("steps");
		} else {
			// default to 8
			this.numSteps = 8;
		}
		
		var xPos = 0;
		var stepWidth = this.width / this.numSteps;
		for (var i = 0; i < this.numSteps; i++) {
			console.log("making div #", i);
			let newDiv = document.createElement("div");	
			newDiv.style.position = "absolute";
			newDiv.style.top = 0;
			newDiv.style.left = xPos + "px";
			newDiv.style.height = this.height + "px";
			newDiv.style.width = stepWidth + "px";

			this.shadow.appendChild(newDiv);

			xPos += stepWidth;
		  /* make div
 			 * make slider
 			 * make step
 			 * store steps
 			 * append to shadow
 			 *
 			 * ideas:
 			 * 	one method to connect all oscillators to something
 			 * 	and to connect to all oscillators	
 			 */ 	
		}

	}

}

customElements.define('step-sequence', SEQU);

