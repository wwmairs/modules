/**
	* module_worker.js
	*
	* a shared worker to store modules between tabs
	* hold onto the context and create and store modules
	*
	**/

var ctx = new (window.AudioContext || window.webkitAudioContext);
var test_modules = [];

onconnect = function(e) {
	var port = e.ports[0];

	port.onmessage = function(e) {
		test_modules.push(e.data);
		console.log('test_modules', test_modules);
		/* messages the worker must respond to
		 * 
		 * 'new instrument'
		 * 'new sequencer'
		 * 'start sequencer'
		 * 'conenct sequencer to instrument'
		 * ''
		 */
		//var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
		//port.postMessage(workerResult);
	}
}
