// a straightforward vco

class VCO {
    constructor(context) {
        this.context = context;
        this.oscillator = context.createOscillator();
        this.oscillator.type = 'sine';
        this.frequency(440);
        this.oscillator.start(0);

        this.input  = this.oscillator;
        this.output = this.oscillator;
    }

    set waveForm(w) {

    }

    get waveForm() {

    }

    set frequency(f) {
        this.frequency = f;
        this.oscillator.frequency.setValueAtTime(f, this.context.currentTime);
    }

    get frequency() {
        return this.frequency;
    }

    connect(module) {
        if (module.hasProperty('input')) {
            this.output.connect(module.input);
        } else {
            this.output.connect(module);
        }
    }
}
