var context = new (window.AudioContext || window.webkitAudioContext);

let vco = new VCO(context);
let vcf = new VCF(context);
let vca = new VCA(context);
let env = new ADSR(context);
let stp = new STEP(context);
let sld = document.getElementById("sld1");

vco.waveForm = 'triangle';

vco.connect(vcf);
vcf.connect(vca);
env.connect(vca.amplitudeParam);
vca.connect(context.destination);

window.setInterval(() => {stp.gateOn()}, 2000);
