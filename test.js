var context = new (window.AudioContext || window.webkitAudioContext);

let vco = new VCO(context);
let vcf = new VCF(context);
let vca = new VCA(context);
let env = new ADSR(context);
let container = document.getElementById("slider-container");

console.log(vcf);


vco.waveForm = 'triangle';

vco.connect(vcf);
vcf.connect(vca);
env.connect(vca.amplitudeParam);
vca.connect(context.destination);

//window.setInterval(() => {env.gateOn()}, 1000);
