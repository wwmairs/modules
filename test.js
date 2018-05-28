var context = new (window.AudioContext || window.webkitAudioContext);

var steps = [];
var slids = document.getElementsByClassName("slider");

for (var i = 0; i < slids.length; i++) {
	let newStep = new STEP(context);
	slids[i].updateCallback = (v) => {
		let newFreq = midiToFrequency(v);
		newStep.frequencyParam.setValueAtTime(newFreq, context.currentTime);
	};
	newStep.connect(context.destination);
	steps.push(newStep);
}

var index = 0;
window.setInterval(() => {
	steps[index].gateOn();
	index = (index + 1) % 8;	
}, 500);
