/**
  * vslider.js
  *
  * a vertical dom object slider
  *
  **/

class VSlider extends HTMLElement {
	constructor() {
		super();
		this.cont   = this.parentNode;
		this.height = this.cont.clientHeight;
		this.width  = this.cont.clientWidth;
		this.sliderHeight = 10;

		// def need a better color scheme, or maybe some programmatic way
		// to set colors
		this.style.background = "#f2e52d";
		this.style.position   = "absolute";
		this.style.height     = this.height + "px";
		this.style.width      = this.width + "px";

		this.shadow = this.attachShadow({mode: "open"});
		this.updateCallback = (v) => v;
		// make a circular element
		this.slider = document.createElement("div");
		this.slider.style.position = "absolute";
		this.slider.style.height = this.sliderHeight + "px";
		this.slider.style.width = "100%";
		this.slider.style.left = "0";
		this.slider.style.top = (this.height / 2) - 5 + "px";
		this.slider.style.background = "#5ed6a3";

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
				that.updateCallback(that.value);
			}
		}

		function endDrag() {
			document.onmouseup   = null;
			document.onmousemove = null;
		}
		this.slider.onmousedown = dragMouseDown;

		this.shadow.appendChild(this.slider);
	}

	get value() {
		return Math.round(scale(this.slider.offsetTop, this.offsetTop,
													  this.offsetTop + this.offsetHeight - this.sliderHeight,
								 						0, 127));

	}
}

customElements.define('vertical-slider', VSlider);

