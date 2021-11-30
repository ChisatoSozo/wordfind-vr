import React from 'react';
import { Sampler } from 'tone';
import { useAudioEffect } from '../hooks/useAudioEffect';
import { useMusic } from '../hooks/useMusic';

interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number,
    numCompletedWords: number,
}

export interface Instruments {
    bassLoop: Sampler;
    bassLoop2: Sampler;
    bassMelody: Sampler;
}

export interface Stage {
    instruments: (keyof Instruments)[];
}

const track: Stage[] = [
    {
        instruments: []
    },
    {
        instruments: ["bassLoop"]
    },
    {
        instruments: ["bassLoop", "bassLoop2"]
    },
    {
        instruments: ["bassLoop", "bassMelody"]
    },
    {
        instruments: ["bassLoop", "bassLoop2", "bassMelody"]
    }
]

export const CrosswordAudio: React.FC<CrosswordAudioProps> = ({ selectedLength, numWords, numCompletedWords }) => {
    const percentComplete = numCompletedWords / numWords;

    const stageNum = Math.min(Math.floor(percentComplete * track.length), track.length - 1);

    const stage = track[stageNum]

    useMusic(stage)
    useAudioEffect(selectedLength, numCompletedWords)
    return null;
}
