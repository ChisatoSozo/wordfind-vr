import { BaseTexture, Mesh, StandardMaterial, Vector3 } from '@babylonjs/core';
import { RefObject, useEffect, useMemo, useState } from 'react';
import { wordListMap } from '../words';
import rawParticleLocations from "./rawParticleLocations.json";

const allCapitalLetters = [
    "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
]

const hydrateParticleLocations = (rawParticleLocations: any) => {
    const particleLocations: { [key: string]: { iconLocations: Vector3[], wordLocations: Vector3[] } } = {};
    const all = { ...wordListMap, letters: allCapitalLetters };
    for (let list in all) {
        const wordList = (all as any)[list] as string[];
        for (let word in wordList) {
            const curParticleLocations = rawParticleLocations[wordList[word]];
            if (curParticleLocations) {
                particleLocations[wordList[word]] = {
                    iconLocations: curParticleLocations.iconLocations.map((iconLocation: number[]) =>
                        new Vector3(iconLocation[0] / 1000, iconLocation[1] / 1000, iconLocation[2] / 1000)),
                    wordLocations: curParticleLocations.wordLocations.map((wordLocation: number[]) =>
                        new Vector3(wordLocation[0] / 1000, wordLocation[1] / 1000, wordLocation[2] / 1000))
                };
            }
            else {
                throw new Error(`No particle locations for ${wordList[word]}`);
            }
        }
    }
    return particleLocations;
}


const _particleLocations = hydrateParticleLocations(rawParticleLocations);

export const getParticles = async (texture: BaseTexture, num = 1000, width = 1, height = 1, onlyBlack = false, textureReady = true, offset?: Vector3) => {

    if (!textureReady) return;
    if (!texture) return;

    const pixels = texture.readPixels() as Uint8Array;

    const particles: Vector3[] = [];
    let iterations = 0;

    while (particles.length < num) {
        const x = Math.floor(Math.random() * texture.getSize().width);
        const y = Math.floor(Math.random() * texture.getSize().height);
        if (pixels[(y * texture.getSize().width + x) * 4 + 3] !== 0 && (!onlyBlack || pixels[(y * texture.getSize().width + x) * 4] < 0.5)) {
            const xPerc = x / texture.getSize().width;
            const yPerc = y / texture.getSize().height;
            const pos = new Vector3(width * xPerc - width / 2, height * yPerc - height / 2, 0).add(offset || new Vector3(0, 0, 0));
            particles.push(pos);
        }
        iterations++;
        if (iterations > 100000) {
            if (particles.length === 0) {
                throw new Error("could not pick from texture: " + texture.name)
            }
            const newNum = particles.length;
            while (particles.length < num) {
                particles.push(particles[Math.floor(Math.random() * newNum)]);
            }
            break;
        }
    }

    return particles;
}

export const useParticleLocations = (cacheName: { word: string, text: boolean } | undefined, meshRef: RefObject<Mesh>, num = 1000, width = 1, height = 1, onlyBlack = false, textureReady = true, offset?: Vector3) => {

    const [particleLocations, setParticleLocations] = useState<Vector3[]>()

    useEffect(() => {
        if (cacheName) return;
        if (!meshRef.current) return;
        const run = async () => {
            if (!meshRef.current) return;

            const texture = (meshRef.current.material as StandardMaterial).emissiveTexture || (meshRef.current.material as StandardMaterial).opacityTexture;

            if (!texture) return;
            const particles = await getParticles(texture, num, width, height, onlyBlack, textureReady, offset);
            setParticleLocations(particles);
        }
        run();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, meshRef, num, onlyBlack, textureReady, width]);
    const cached = useMemo(() => {
        if (!cacheName) return;
        const cachedParticles = _particleLocations[cacheName.word];
        if (!cachedParticles) throw new Error("No particles found for " + cacheName.word);
        return (cacheName.text ? cachedParticles.wordLocations : cachedParticles.iconLocations).map((location: Vector3) => location.add(offset || new Vector3(0, 0, 0)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return cacheName ? cached : particleLocations;
}
