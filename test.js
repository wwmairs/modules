var context = new (window.AudioContext || window.webkitAudioContext);

let vco = new VCO(context);
let vca = new VCA(context);
let env = new ADSR(context);

vco.connect(vca);
env.connect(vca.amplitudeParam);
vca.connect(context.destination);