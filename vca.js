// a straightforward vca

class VCA {
    constructor(context) {
        this.context         = context;
        this.gain            = context.createGain();
        this.input           = this.gain;
        this.output          = this.gain;
        this.amplitudeParam  = this.gain.gain;
        this.amplitude       = 0;
    }

    set amplitude(a) {
        this.gain.gain.setValueAtTime(a, this.context.currentTime);
    }

    get amplitude() {
        return this.gain.gain.value;
    }

    connect(module) {
        if (module.hasOwnProperty('input')) {
            this.output.connect(module.input);
        } else {
            this.output.connect(module);
        }
    }
}