import { useEffect, useState } from 'react';
import { Synth } from 'tone';
import { useInteract } from './useInteract';

export const useMusic = () => {

    const [synth, setSynth] = useState<Synth>(new Synth());

    useInteract(() => {
        //create a synth and connect it to the main output (your speakers)
        const synth = new Synth().toDestination();

        setSynth(synth);
    })

    useEffect(() => {

    }, [])
}
