var context = new (window.AudioContext || window.webkitAudioContext);
var sliderTest = 0;

let vco = new VCO(context);
let vcf = new VCF(context);
let vca = new VCA(context);
let env = new ADSR(context);

let sld = document.getElementById("slider1")
sld.updateCallback = (v) => sliderTest = v;

vco.waveForm = 'triangle';

vco.connect(vcf);
vcf.connect(vca);
env.connect(vca.amplitudeParam);
vca.connect(context.destination);

//window.setInterval(() => {console.log("slide:", sliderTest)}, 100);
