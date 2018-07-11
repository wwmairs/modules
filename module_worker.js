/**
	* module_worker.js
	*
	* a shared worker to store modules between tabs
	*
	**/

onconnect = function(e) {
	var port = e.ports[0];

	port.onmessage = function(e) {
		/* need to plan lots
		 */
		//var workerResult = 'Result: ' + (e.data[0] * e.data[1]);
		//port.postMessage(workerResult);
	}
}
