import React, { useEffect, useMemo } from 'react';
import { useScene } from 'react-babylonjs';
import { Sampler } from 'tone';
import { Chord } from '../components/CrosswordAudio';
import { useInteract } from './useInteract';

export type NoteName = 'A' | 'A#' | 'B' | 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#'

const noteNumber = {
    'A': 0,
    'A#': 1,
    'B': 2,
    'C': 3,
    'C#': 4,
    'D': 5,
    'D#': 6,
    'E': 7,
    'F': 8,
    'F#': 9,
    'G': 10,
    'G#': 11,
} as const

const getKeyByValue = <T>(object: { [key: string]: T }, value: T) => {
    return Object.keys(object).find(key => object[key] === value);
}

const scaleProbabilities = [2, 0.5, 1, 0.5, 1, 0.6, 0.2]

interface Note {
    note: NoteName
    octave: number
}

type NoteNumber = (typeof noteNumber)[NoteName];
type Scale = (typeof noteNumber)[NoteName][];
export type Key = 'major' | 'minor' | 'phrygian dominant'

const constructScale = (rootNote: Note, key: Key) => {
    const root = noteNumber[rootNote.note];
    const scale: Scale = [];
    switch (key) {
        case 'major':
            scale.push(root % 12 as NoteNumber);
            scale.push((root + 2) % 12 as NoteNumber);
            scale.push((root + 4) % 12 as NoteNumber);
            scale.push((root + 5) % 12 as NoteNumber);
            scale.push((root + 7) % 12 as NoteNumber);
            scale.push((root + 9) % 12 as NoteNumber);
            scale.push((root + 11) % 12 as NoteNumber);
            break;
        case 'minor':
            scale.push(root % 12 as NoteNumber);
            scale.push((root + 2) % 12 as NoteNumber);
            scale.push((root + 3) % 12 as NoteNumber);
            scale.push((root + 5) % 12 as NoteNumber);
            scale.push((root + 7) % 12 as NoteNumber);
            scale.push((root + 9) % 12 as NoteNumber);
            scale.push((root + 11) % 12 as NoteNumber);
            break;
        case 'phrygian dominant':
            scale.push(root % 12 as NoteNumber);
            scale.push((root + 1) % 12 as NoteNumber);
            scale.push((root + 4) % 12 as NoteNumber);
            scale.push((root + 5) % 12 as NoteNumber);
            scale.push((root + 7) % 12 as NoteNumber);
            scale.push((root + 8) % 12 as NoteNumber);
            scale.push((root + 10) % 12 as NoteNumber);
    }
    return scale;
}

const getNextNote = (scale: Scale, currentNote: Note) => {
    const scaleIndex = scale.indexOf(noteNumber[currentNote.note]);

    const possibleNextNotes: (Note & { probability: number })[] = [];

    for (let i = -4; i < 5; i++) {
        if (i === 0) continue;
        let newScaleIndex = scaleIndex + i;
        if (newScaleIndex < 0) {
            newScaleIndex += scale.length;
        }
        else if (newScaleIndex >= scale.length) {
            newScaleIndex -= scale.length;
        }

        const currentNoteNumber = scale[scaleIndex];
        const nextNoteNumber = scale[newScaleIndex];
        let newOctave = currentNote.octave;

        if (i < 0 && nextNoteNumber > currentNoteNumber) {
            newOctave--;
        }
        if (i > 0 && nextNoteNumber < currentNoteNumber) {
            newOctave++;
        }

        possibleNextNotes.push({
            note: getKeyByValue(noteNumber, scale[newScaleIndex]) as NoteName,
            octave: newOctave,
            probability: scaleProbabilities[newScaleIndex] / Math.abs(i / 3)
        });
    }

    const totalProbability = possibleNextNotes.reduce((acc, cur) => acc + cur.probability, 0);
    const random = Math.random() * totalProbability;
    let currentProbability = 0;
    for (let i = 0; i < possibleNextNotes.length; i++) {
        const note = possibleNextNotes[i];
        currentProbability += note.probability;
        if (currentProbability > random) {
            return note;
        }
    }
    throw new Error("check probability code")
}

export const useAudioEffect = (numLetters: number, numCompletedWords: number, chord: Chord, melodyChord: Chord) => {
    const scene = useScene();
    const rootNote = useMemo(() => ({ note: melodyChord.root, octave: 4 }), [melodyChord]);
    const scale = useMemo(() => constructScale(rootNote, melodyChord.scale), [rootNote, melodyChord]);

    const sound = useMemo(() => {
        if (!scene) return;
        const sound = new Sampler({
            urls: {
                "G#5": "Vocal.wav",
            },
            baseUrl: "/sounds/",
        }).toDestination()
        sound.volume.value = -10;
        return sound;
    }, [scene])

    const success = useInteract(() => {
        const sound = new Sampler({
            urls: {
                "C4": "success.mp3",
            },
            baseUrl: "/sounds/",
        }).toDestination()
        sound.volume.value = -5
        return sound
    })

    const [currentNote, setCurrentNote] = React.useState<Note>(rootNote)

    useEffect(() => {
        if (success && numCompletedWords > 0) {
            const _success = success;
            if (_success.loaded) {
                _success.triggerAttackRelease(chord.root + "3", "4m")
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numCompletedWords, success])

    useEffect(() => {
        if (!sound || numLetters === 0) return;

        const nowNote = numLetters === 1 ? { note: melodyChord.root, octave: Math.random() > 0.5 ? 4 : 5 } : currentNote;

        if (sound.loaded)
            sound.triggerAttackRelease(nowNote.note + nowNote.octave.toString(), "1m");

        const nextNote = getNextNote(scale, nowNote);
        setCurrentNote(nextNote);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numLetters])
}
