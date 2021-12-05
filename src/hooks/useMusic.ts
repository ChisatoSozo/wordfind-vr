import { useEffect, useState } from 'react';
import { loaded, Loop, Sampler, Synth, Transport } from 'tone';
import { Instruments, Stage } from '../components/CrosswordAudio';
import { useInteract } from './useInteract';



const barLoop = (instrument: Sampler, note: string) => {
    const bar1 = new Loop(time => {
        instrument.triggerAttackRelease(note, '2m', time);
    }, '2m').start(0);
    const bar2 = new Loop(time => {
        instrument.triggerAttackRelease(note, '2m', time);
    }, '2m').start('1m');

    return [bar1, bar2]
}

const bar4Loop = (instrument: Sampler, note: string) => {
    const bar1 = new Loop(time => {
        instrument.triggerAttackRelease(note, '8m', time);
    }, '8m').start(0);
    const bar2 = new Loop(time => {
        instrument.triggerAttackRelease(note, '8m', time);
    }, '8m').start('4m');

    return [bar1, bar2]
}

export const useMusic = (stage: Stage) => {

    const [synth, setSynth] = useState<Synth>();
    const [instruments, setInstruemnts] = useState<Instruments>();

    useInteract(() => {
        //create a synth and connect it to the main output (your speakers)
        const synth = new Synth().toDestination();

        const bassLoop = new Sampler({
            urls: {
                "C2": "bass.mp3",
            },
            baseUrl: "/sounds/",
        }).toDestination();

        const bassLoop2 = new Sampler({
            urls: {
                "C3": "bass2.mp3",
            },
            baseUrl: "/sounds/",
        }).toDestination();

        const bassMelody = new Sampler({
            urls: {
                "C3": "bassMelody.mp3",
            },
            baseUrl: "/sounds/",
        }).toDestination();

        loaded().then(() => {
            const instruments = {
                bassLoop,
                bassLoop2,
                bassMelody
            }

            Transport.bpm.value = 86;
            Transport.start();

            Object.values(instruments).forEach(instrument => instrument.volume.value = -10);
            setInstruemnts(instruments);
        });


        setSynth(synth);

    })

    useEffect(() => {
        if (!synth || !instruments) return;

        const loops: Loop[] = []
        if (stage.instruments.includes("bassLoop"))
            loops.push(...barLoop(instruments.bassLoop, "C2"));

        if (stage.instruments.includes("bassLoop2"))
            loops.push(...barLoop(instruments.bassLoop2, "C3"));

        if (stage.instruments.includes("bassMelody"))
            loops.push(...bar4Loop(instruments.bassMelody, "C3"));

        return () => {
            loops.forEach(loop => loop.stop());
        }
    }, [instruments, stage, synth])
}
