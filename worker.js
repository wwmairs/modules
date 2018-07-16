/**
	* module_worker.js
	*
	* a shared worker to store modules between tabs
	* hold onto the context and create and store modules
	*
	**/
import "modules.js";

var ctx = new (window.AudioContext || window.webkitAudioContext);
var instruments = [];

onconnect = function(e) {
	var port = e.ports[0];

	port.onmessage = function(e) {
		/** accepts commands:
			* 'new <instrument type>'
			* 'noteon <instrument name>'
			* 'noteon <instrument name> duration'
			* 'noteon <instrument name> duration frequency'
			**/
	  let cmd = e.data[0].split(" ");	
		switch(cmd[0]) {
			case 'new':
				/** accepts types:
				  * 'FM'
					**/
				switch(cmd[1]) {
					case 'FM':
						let newFM = new FM(ctx);
						let name  = "FM" + instruments.length;
						instruments.push({"name" : name, "instrument" : newFM});
						port.postMessage("new FM " + name);
					default:
						throw new Error("Unrecognized intstrument name:", cmd[1]);
				}
			case 'noteon':
				switch(cmd.length) {
					// 'noteon <instrument name>'
					case 2:
					// 'noteon <instrument name> duration'
					case 3:
					// 'noteon <instrument name> duration frequency'
					case 4:
					default:
						throw new Error("Unrecognized noteon command:", e.data[0]);
				}
			default:
				throw new Error("Unrecognized command:", e.data[0]);
		}
		/* messages the worker must respond to
		 * a method, possibly with args
		 */
		//var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
		//port.postMessage(workerResult);
	}
}
