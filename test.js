var context = new (window.AudioContext || window.webkitAudioContext);

var cont = document.getElementById("step-container");

let slide = document.createElement("vertical-slider");
cont.appendChild(slide);
console.log(slide);

