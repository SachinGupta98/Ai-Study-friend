/**
 * soundscapeService.ts — Procedural Ambient Sound Generator
 * Powered by Web Audio API — zero external audio assets required, 100% offline & fast!
 *
 * Soundscapes:
 *   - 'rain'      : Cozy lo-fi rainfall with soothing droplet filters
 *   - 'binaural'  : 40Hz Gamma / 10Hz Alpha focus beats (promotes deep concentration)
 *   - 'brown'     : Deep brown noise (blocks room echo, ideal for reading)
 *   - 'cafe'      : Gentle low-end warmth & ambient coffeehouse hum
 */

export type SoundscapeType = 'none' | 'rain' | 'binaural' | 'brown' | 'cafe';

class SoundscapeEngine {
    private ctx: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private currentSound: SoundscapeType = 'none';
    private activeNodes: (AudioNode | number)[] = [];
    private volume: number = 0.5;

    private getContext(): AudioContext {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    public setVolume(val: number) {
        this.volume = Math.max(0, Math.min(1, val));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
        }
    }

    public getVolume(): number {
        return this.volume;
    }

    public getCurrentSound(): SoundscapeType {
        return this.currentSound;
    }

    public stop() {
        this.activeNodes.forEach(node => {
            if (typeof node === 'number') {
                window.clearInterval(node);
            } else {
                try {
                    (node as any).stop?.();
                    node.disconnect();
                } catch { /* ignore */ }
            }
        });
        this.activeNodes = [];
        this.currentSound = 'none';
    }

    public play(type: SoundscapeType) {
        this.stop();
        if (type === 'none') return;

        const ctx = this.getContext();
        this.masterGain = ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
        this.masterGain.connect(ctx.destination);
        this.currentSound = type;

        switch (type) {
            case 'rain':
                this.startRain(ctx, this.masterGain);
                break;
            case 'binaural':
                this.startBinaural(ctx, this.masterGain);
                break;
            case 'brown':
                this.startBrownNoise(ctx, this.masterGain);
                break;
            case 'cafe':
                this.startCafeHum(ctx, this.masterGain);
                break;
        }
    }

    // ── Rain Generator ────────────────────────────────────────────────────────
    private startRain(ctx: AudioContext, destination: AudioNode) {
        // Pink noise buffer
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
            b6 = white * 0.115926;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, ctx.currentTime);

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(300, ctx.currentTime);

        noise.connect(filter);
        filter.connect(highpass);
        highpass.connect(destination);
        noise.start();
        this.activeNodes.push(noise, filter, highpass);
    }

    // ── Binaural Focus Beats (40Hz Gamma) ────────────────────────────────────
    private startBinaural(ctx: AudioContext, destination: AudioNode) {
        const baseFreq = 200; // Comfortable carrier frequency
        const beatFreq = 14;  // 14Hz Alpha-Beta boundary for peak alertness

        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();

        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        oscR.frequency.setValueAtTime(baseFreq + beatFreq, ctx.currentTime);

        const merger = ctx.createChannelMerger(2);
        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.3;
        gainR.gain.value = 0.3;

        oscL.connect(gainL);
        oscR.connect(gainR);
        gainL.connect(merger, 0, 0);
        gainR.connect(merger, 0, 1);
        merger.connect(destination);

        oscL.start();
        oscR.start();
        this.activeNodes.push(oscL, oscR, gainL, gainR, merger);
    }

    // ── Brown Noise (Deep Study) ─────────────────────────────────────────────
    private startBrownNoise(ctx: AudioContext, destination: AudioNode) {
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            data[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = data[i];
            data[i] *= 3.5;
        }

        const brownSource = ctx.createBufferSource();
        brownSource.buffer = buffer;
        brownSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(450, ctx.currentTime);

        brownSource.connect(lowpass);
        lowpass.connect(destination);
        brownSource.start();
        this.activeNodes.push(brownSource, lowpass);
    }

    // ── Cafe Ambient Hum ─────────────────────────────────────────────────────
    private startCafeHum(ctx: AudioContext, destination: AudioNode) {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.15;

        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(110, ctx.currentTime);
        osc2.frequency.setValueAtTime(220, ctx.currentTime);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(destination);

        osc1.start();
        osc2.start();
        this.activeNodes.push(osc1, osc2, gain, filter);
    }
}

export const soundscape = new SoundscapeEngine();
