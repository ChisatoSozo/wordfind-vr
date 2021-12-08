import React, { useEffect } from 'react';
import { Key, NoteName, useAudioEffect } from '../hooks/useAudioEffect';
import { useMusic } from '../hooks/useMusic';

interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number,
    numCompletedWords: number,
}



interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number,
    numCompletedWords: number,
}

export interface Chord {
    root: NoteName,
    scale: Key,
}

interface PhaseDefinition {
    duration: number
    melodyChord: Chord,
    chord: Chord
}

export interface AudioDefinition {
    bpm: number,
    timeSignature: number,
    volume: number,
    pre: PhaseDefinition
    post: PhaseDefinition
    phases: PhaseDefinition[]
}

export const CrosswordAudio: React.FC<CrosswordAudioProps> = ({ selectedLength, numWords, numCompletedWords }) => {
    const percentComplete = numCompletedWords / numWords;


    const songName = 'awaken'

    const [audioDef, setAudioDef] = React.useState<AudioDefinition | null>(null);
    const phaseNum = audioDef ? Math.min(Math.floor(percentComplete * audioDef.phases.length), audioDef.phases.length - 1) : 0;
    useEffect(() => {
        fetch(`/music/${songName}/def.json`)
            .then(res => res.json())
            .then(setAudioDef)
    }, [])

    const [chord, setChord] = React.useState<Chord>();
    const [melodyChord, setMelodyChord] = React.useState<Chord>();

    useMusic(audioDef, songName, phaseNum, setChord, setMelodyChord);
    useAudioEffect(selectedLength, numCompletedWords, chord || { root: 'A', scale: 'major' }, melodyChord || { root: 'A', scale: 'major' });
    return null;
}
