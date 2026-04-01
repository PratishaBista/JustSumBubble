export default class AudioSystem {
    constructor() {
        this.popSound = new Audio('./assets/sounds/bubble-pop.mp3');
        this.popSound.volume = 0.5;
    }

    playPop() {
        const soundClone = this.popSound.cloneNode();

        soundClone.play();
    }
}
