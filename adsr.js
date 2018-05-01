// a straightforward adsr

class ADSR {
    constructor(context) {
        this.context = context;
        this.attackTime  = 0.05;
        this.decayTime   = 0.2;
        this.sustainValue = .5;
        this.releaseTime = 0.2;
    }

    set attack(a) {
        this.attackTime = a;
    }
    get attack() {
        return this.attackTime;
    }

    set decay(d) {
        this.decayTime = d;
    }
    get decay() {
        return this.decayTime;
    }

    set sustain(s) {
        this.sustainValue = s;
    }
    get sustain() {
        return this.sustainValue;
    }

    set release(r) {
        this.releaseTime = r;
    }
    get release() {
        return this.releaseTime;
    }

    gateOn() {
        let now = this.context.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(0, now);
        this.param.linearRampToValueAtTime(1, now + this.attack);
        // something different happens if you're holding a note
        this.param.linearRampToValueAtTime(0, now + this.attack 
                                                  + this.release);
    }

    // unlike other modules, this one connects to an AudioParam, 
    // rather than either a module or an AudioNode
    connect(param) {
        this.param = param;
    }
}