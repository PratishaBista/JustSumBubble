import config from '../systems/Config.js';

export default class Particle {
    constructor(parent, x, y) {
        this.parent = parent;
        this.element = document.createElement('div');
        this.element.classList.add('particle');

        const activeTheme = config.theme;
        this.element.style.background = activeTheme.particle;

        this.x = x;
        this.y = y;

        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8 - 4;

        this.gravity = 0.12;
        this.life = 1.0;
        this.fadeSpeed = 0.008 + Math.random() * 0.01;

        this.driftSeed = Math.random() * 100;

        this.parent.appendChild(this.element);
    }

    update() {
        this.x += this.vx;
        this.vy += this.gravity;
        this.y += this.vy;

        this.x += Math.sin(this.y * 0.05 + this.driftSeed) * 0.5;

        this.life -= this.fadeSpeed;

        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0) scale(${this.life})`;
        this.element.style.opacity = this.life;

        if (this.life <= 0) {
            this.element.remove();
            return true;
        }
        return false;
    }
}
