const introSound = new Audio("/sounds/intro.mp3")
const backgroundSound = new Audio("/sounds/C-Ambience.mp3")
const newLevelSound = new Audio("/sounds/success.mp3")

const playSound = (sound: HTMLAudioElement, volume = 0.3, loop = false) => {
    if (sound.paused || !loop) {
        sound.volume = volume;
        sound.loop = loop
        sound.pause();
        sound.currentTime = 0
        sound.play()
    }
}

export { backgroundSound, introSound, newLevelSound, playSound };

