const introSound = new Audio("/sounds/intro.mp3")
const backgroundSound = new Audio("/sounds/C-Ambience.mp3")

const playSound = (sound: HTMLAudioElement, volume = 0.3, loop = false) => {
    if (sound.paused) {
        sound.volume = volume;
        sound.loop = loop
        sound.play()
    }
}

export { backgroundSound, introSound, playSound };

