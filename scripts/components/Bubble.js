import config from "../systems/Config.js";

export default class Bubble {
  constructor(audioSystem, particleCallback, initialY = null) {
    this.audioSystem = audioSystem;
    this.particleCallback = particleCallback;
    this.isPopped = false;

    const size = Math.random() * 60 + 120;
    this.size = size;

    this.element = document.createElement("div");
    this.element.classList.add("bubble");

    this.element.style.width = `${size}px`;
    this.element.style.height = `${size}px`;

    this.updateAppearance();
    this.init(initialY);
  }

  updateAppearance() {
    const color = config.bubbleColor;
    const glow = config.glowIntensity / 100;

    this.element.style.borderColor = color
      .replace("0.4", "0.65")
      .replace("0.5", "0.75");

    this.element.style.background = `radial-gradient(circle at 30% 30%, ${color} 0%, transparent 70%)`;

    const glowSize = Math.round(glow * 30);
    const glowOpacity = (glow * 0.7).toFixed(2);
    this.element.style.boxShadow = [
      `inset 0 20px 40px rgba(255,255,255,0.5)`,
      `inset 10px 10px 20px rgba(255,255,255,0.3)`,
      `0 0 ${glowSize}px ${Math.round(glowSize / 2)}px rgba(255,255,255,${glowOpacity})`,
      `0 15px 35px rgba(0,0,0,0.06)`,
    ].join(", ");
  }

  init(initialY = null) {
    this.isPopped = false;
    this.element.classList.remove("popped");

    this.updateAppearance();

    const side = initialY !== null ? 0 : Math.floor(Math.random() * 3);

    if (side === 0) {
      this.x = Math.random() * (window.innerWidth - this.size);
      this.y = initialY !== null ? initialY : window.innerHeight + 200;
      this.baseVX = (Math.random() - 0.5) * 0.8;
      this.baseVY = -(Math.random() * 1.0 + 1.2);
    } else if (side === 1) {
      this.x = -250;
      this.y = Math.random() * (window.innerHeight - this.size);
      this.baseVX = Math.random() * 1.5 + 0.8;
      this.baseVY = -(Math.random() * 0.8 + 0.4);
    } else {
      this.x = window.innerWidth + 250;
      this.y = Math.random() * (window.innerHeight - this.size);
      this.baseVX = -(Math.random() * 1.5 + 0.8);
      this.baseVY = -(Math.random() * 0.8 + 0.4);
    }

    this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
  }

  update() {
    if (this.isPopped) return;

    this.x += this.baseVX;
    this.y += this.baseVY;

    const wx = Math.sin(this.y * 0.04) * 4;
    const wy = Math.cos(this.x * 0.04) * 4;

    this.element.style.transform = `translate3d(${this.x + wx}px, ${this.y + wy}px, 0)`;

    const offScreen =
      this.y < -300 ||
      this.x < -400 ||
      this.x > window.innerWidth + 400 ||
      this.y > window.innerHeight + 500;
    if (offScreen) {
      if (!this._retire) {
        this.init();
      }
    }
  }

  pop() {
    if (this.isPopped) return;
    this.isPopped = true;
    this.element.classList.add("popped");

    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    if (this.particleCallback) {
      this.particleCallback(centerX, centerY);
    }

    if (this.audioSystem) {
      this.audioSystem.playPop();
    }

    setTimeout(() => this.reset(), 500);
  }

  reset() {
    this.init();
  }
}
