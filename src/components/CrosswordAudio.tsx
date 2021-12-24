import React, { useEffect } from 'react';
import { Key, NoteName, useAudioEffect } from '../hooks/useAudioEffect';
import { useMusic } from '../hooks/useMusic';
import { getLS } from '../utils/LS';

interface CrosswordAudioProps {
    selectedLength: number,
    numWords: number,
    numCompletedWords: number,
    song: string
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
    phases: PhaseDefinition[],
}

export const allSongs = ['silverLining', 'awaken', 'whatCouldHaveBeen', 'sheep']

export const CrosswordAudio: React.FC<CrosswordAudioProps> = ({ song, selectedLength, numWords, numCompletedWords }) => {
    const percentComplete = numCompletedWords / numWords;


    const [audioDef, setAudioDef] = React.useState<AudioDefinition | null>(null);
    const phaseNum = audioDef ? Math.min(Math.floor(percentComplete * audioDef.phases.length), audioDef.phases.length - 1) : 0;
    useEffect(() => {
        if (!getLS("playMusic")) return;
        fetch(`${process.env.PUBLIC_URL}/music/${song}/def.json`)
            .then(res => res.json())
            .then(setAudioDef)
    }, [song])

    const [chord, setChord] = React.useState<Chord>();
    const [melodyChord, setMelodyChord] = React.useState<Chord>();

    useMusic(audioDef, song, phaseNum, setChord, setMelodyChord);
    useAudioEffect(selectedLength, numCompletedWords, chord || { root: 'C', scale: 'phrygian dominant' }, melodyChord || { root: 'C', scale: 'phrygian dominant' });
    return null;
}
