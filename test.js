var context = new (window.AudioContext || window.webkitAudioContext);

let stp = new STEP(context);
stp.connect(context.destination);
let sld = document.getElementById("sld1");


window.setInterval(() => {stp.gateOn()}, 2000);
