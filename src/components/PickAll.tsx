import { Scene, Texture } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { getParticles } from '../hooks/useParticleLocations';
import { PARTICLES_PER_ICON } from '../scenes/SceneMenu';
import { wordListMap } from '../words';

interface ParticlesDef {
    [key: string]: {
        iconLocations: number[][],
        wordLocations: number[][],
    }
}

const particlesDefJson: ParticlesDef = {

}

function saveJSON(data: any, filename: string) {

    if (!data) {
        console.error('No data')
        return;
    }

    if (!filename) filename = 'console.json'

    if (typeof data === "object") {
        data = JSON.stringify(data)
    }

    var blob = new Blob([data], { type: 'text/json' }),
        e = document.createEvent('MouseEvents'),
        a = document.createElement('a')

    a.download = filename
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}

const asyncTexture = (url: string, scene: Scene) => {
    return new Promise<Texture>((resolve, reject) => {
        let texture: Texture;
        texture = new Texture(url, scene, undefined, undefined, undefined, () => {
            resolve(texture);
        }, () => {
            reject();
        })
    })
}

const sleep = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const allCapitalLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

const cleanVectorArray = (arr: Vector3[]) => {
    return arr.map(v => {
        return [
            Math.floor(v.x * 1000),
            Math.floor(v.y * 1000),
            Math.floor(v.z * 1000)
        ]
    })
}

export const PickAll = () => {


    const scene = useScene();
    useEffect(() => {
        if (!scene) return;
        const run = async () => {
            const categories = Object.keys(wordListMap)
            for (let category of categories) {
                //@ts-ignore
                const wordList = wordListMap[category] as string[]
                for (let word of wordList) {
                    const texture = await asyncTexture(`${process.env.PUBLIC_URL}/icons/${category}/${word}.png`, scene);
                    const wordsTexture = new AdvancedDynamicTexture(word + "text", 512, 128, scene, false);
                    const text = new TextBlock();
                    text.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
                    text.text = word;
                    text.fontSize = 80;
                    text.fontStyle = 'bold';
                    text.color = 'white';
                    wordsTexture.addControl(text);
                    wordsTexture.update();

                    await sleep(30);
                    console.log(wordsTexture.getInternalTexture()?._workingCanvas)

                    const particles = await getParticles(texture, PARTICLES_PER_ICON, 1, 1, true, true, undefined);
                    if (!particles) throw new Error(`Could not get particles for ${word}`);


                    const textParticles = await getParticles(wordsTexture, PARTICLES_PER_ICON, 4, 1);
                    if (!textParticles) throw new Error(`Could not get particles text for ${word}`);


                    particlesDefJson[word as string] = { iconLocations: cleanVectorArray(particles), wordLocations: cleanVectorArray(textParticles) };
                    console.log("Saved", word);
                }
            }
            for (let letter of allCapitalLetters) {
                const wordsTexture = new AdvancedDynamicTexture(letter, 256, 256, scene, false);
                const text = new TextBlock();
                text.text = letter;
                text.fontSize = 256;
                text.fontStyle = 'bold';
                text.color = 'white';
                wordsTexture.addControl(text);
                wordsTexture.update();
                await sleep(30);
                const textParticles = await getParticles(wordsTexture, PARTICLES_PER_ICON, 1, 1);
                if (!textParticles) throw new Error(`Could not get particles text for letter ${letter}`);
                particlesDefJson[letter] = { iconLocations: [], wordLocations: cleanVectorArray(textParticles) };
                console.log("Saved", letter);
            }
            saveJSON(particlesDefJson, 'particlesDef.json');
        }
        run();
    }, [scene])

    return null;
}
