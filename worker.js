/**
	* module_worker.js
	*
	* a shared worker to store modules between tabs
	* hold onto the context and create and store modules
	*
	**/

var instruments = [];
	importScripts();

onconnect = function(e) {
//	importScripts("modules.js");
	
	var ctx = new (self.AudioContext || self.webkitAudioContext);
	
	console.log('worker conected');
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
						console.log("received new FM message");
						let newFM = new FM(ctx);
						let name  = "FM" + instruments.length;
						instruments.push({"name" : name, "instrument" : newFM});
						port.postMessage("created FM " + name);
						console.log("posted message from worker after creating new FM");
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
				//throw new Error("Unrecognized command:", e.data[0]);
				port.postMessage("unrecognized message received by worker");
		}
	}
}
