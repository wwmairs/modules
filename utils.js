/**
  * utils.js
  *
  **/


function scale(x, lowIn, highIn, lowOut, highOut) {
	return (((highOut - lowOut) * (x - lowIn))/(highIn - lowIn)) + lowOut;
}
