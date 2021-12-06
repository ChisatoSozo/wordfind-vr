import { useEffect, useRef, useState } from 'react';
import { loaded, Loop, Sampler, Transport } from 'tone';
import { AudioDefinition, Chord } from '../components/CrosswordAudio';
import { useInteract } from './useInteract';

const constructSynth = (song: string, index: number | string, volume: number) => {
    const sampler = new Sampler({
        urls: {
            "C4": index + ".mp3",
        },
        baseUrl: `/music/${song}/`,
    }).toDestination();
    sampler.volume.value = -10;

    return sampler;
}

interface Samplers {
    pre?: Sampler;
    post?: Sampler;
    phases: Sampler[];
}

export const useMusic = (audioDef: AudioDefinition | undefined, songName: string, phase: number, setChord: (chord: Chord) => void, setMelodyChord: (chord: Chord) => void) => {

    const [samplers, setSamplers] = useState<Samplers>();
    const playingPhase = useRef(-1);
    const barsInPhase = useRef(0);
    const currentPhase = useRef(phase)
    useEffect(() => {
        currentPhase.current = phase;
    }, [phase])

    useEffect(() => {
        return () => {
            if (samplers) {
                samplers.pre?.dispose();
                samplers.post?.dispose();
                samplers.phases.forEach(s => s.dispose());
            }
        }
    }, [samplers])

    useInteract(() => {
        if (!audioDef) return;
        //create a synth and connect it to the main output (your speakers)
        let pre: Sampler | undefined;
        let post: Sampler | undefined;
        let phases: Sampler[] = [];

        if (audioDef.pre) {
            pre = constructSynth(songName, "pre", audioDef.volume);
        }
        if (audioDef.post) {
            post = constructSynth(songName, "post", audioDef.volume);
        }
        for (let i = 0; i < audioDef.phases.length; i++) {
            phases.push(constructSynth(songName, i, audioDef.volume));
        }

        console.log("test")

        loaded().then(() => {
            const samplers: Samplers = {
                pre,
                post,
                phases
            }

            Transport.bpm.value = audioDef.bpm;
            Transport.timeSignature = audioDef.timeSignature;
            Transport.start();
            if (pre) {
                pre?.triggerAttackRelease("C4", audioDef.pre.duration + "m");
                barsInPhase.current = audioDef.pre.duration;
            }
            let loop: Loop | undefined;
            loop = new Loop(time => {
                barsInPhase.current--;
                if (barsInPhase.current <= 0) {
                    if (currentPhase.current !== playingPhase.current) {
                        if (currentPhase.current === audioDef.phases.length) {
                            if (audioDef.post)
                                samplers.phases[currentPhase.current].triggerAttackRelease("C4", audioDef.post.duration + 1 + "m", time);
                            loop?.stop()
                            return;
                        }
                        playingPhase.current = currentPhase.current;
                    }
                    barsInPhase.current += audioDef.phases[currentPhase.current].duration;
                    samplers.phases[currentPhase.current].triggerAttackRelease("C4", audioDef.phases[currentPhase.current].duration + 1 + "m", time);
                }
                const phaseDef = audioDef.phases[playingPhase.current] || audioDef.phases[0]
                setChord(phaseDef.chord)
                setMelodyChord(phaseDef.melodyChord)
            }, '1m').start(0);

            setSamplers(samplers);
        });
    }, [audioDef])
}
