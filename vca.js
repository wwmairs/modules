// a straightforward vca

class VCA {
    constructor(context) {
        this.context = context;
        this.gain = context.createGain();
        this.gain.gain.value = 0;
        this.input = this.gain;
        this.output = this.gain;
        this.amplitude = this.gain.gain;

    }

    set amplitude(a) {
        this.amplitude = a;
        this.gain.gain.value = a;
    }

    get amplitude() {
        return this.amplitude;
    }

    connect(module) {
        if (module.hasOwnProperty('input')) {
            this.output.connect(module.input);
        } else {
            this.output.connect(module);
        }
    }
}