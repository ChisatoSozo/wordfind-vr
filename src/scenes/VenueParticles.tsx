import { TransformNode, Vector3 } from '@babylonjs/core';
import { times } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VenueComponent } from '../App';
import { Capsules } from '../components/Capsules';
import { CrosswordAudio } from '../components/CrosswordAudio';
import { CrosswordLetters } from '../components/CrosswordLetters';
import { CrosswordList } from '../components/CrosswordList';
import { useInteract } from '../hooks/useInteract';
import { useSlideIn } from '../hooks/useSlideIn';
import { useWordSearch } from '../hooks/useWordSearch';
import { backgroundSound, playSound } from '../sounds/Sounds';

export const VenueParticles: VenueComponent = ({ crosswordDimensions, words: _words, iconRoot }) => {

    const offset = useMemo(() => new Vector3(-0.5 * crosswordDimensions.x, 0, 1.5 * Math.max(crosswordDimensions.y, crosswordDimensions.x)), [crosswordDimensions.x, crosswordDimensions.y]);
    const rootRef = useRef<TransformNode>(null)
    useSlideIn(rootRef)

    console.log(crosswordDimensions, _words)
    const ws = useWordSearch(crosswordDimensions, _words);
    const words = useMemo(() => ws.words.map(word => word.word), [ws]);
    useInteract(() => playSound(backgroundSound, 0.3, true));

    const [firstClicked, setFirstClicked] = useState<{ x: number, y: number } | null>(null);
    const [currentHover, setCurrentHover] = useState<{ x: number, y: number } | null>(null);

    const [completedWords, setCompletedWords] = useState<string[]>([]);
    const [solvedCoordinatePairs, setSolvedCoordinatePairs] = useState<[{ x: number, y: number }, { x: number, y: number }][]>([]);
    const [highlightedIndicies, setHighlightedIndicies] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        if (!firstClicked && highlightedIndicies.length !== 0) {
            const word = highlightedIndicies.map(index => ws.grid[index.y][index.x]).join('');

            if (words.includes(word.toLowerCase())) {
                setCompletedWords([...completedWords, word]);
                setSolvedCoordinatePairs([...solvedCoordinatePairs, [highlightedIndicies[0], highlightedIndicies[highlightedIndicies.length - 1]]]);
            }
            setHighlightedIndicies([]);
            return;
        }
    }, [completedWords, firstClicked, highlightedIndicies, solvedCoordinatePairs, words, ws.grid])

    useEffect(() => {
        if (!firstClicked) return;
        if (!currentHover) return;

        const delta = { x: currentHover.x - firstClicked.x, y: currentHover.y - firstClicked.y };

        if (
            delta.x === 0 ||
            delta.y === 0 ||
            Math.abs(delta.x) === Math.abs(delta.y)
        ) {
            const max = Math.max(Math.abs(delta.x), Math.abs(delta.y));

            if (max === 0) {
                setHighlightedIndicies([{ ...firstClicked }]);
                return;
            }

            const norm = { x: delta.x / max, y: delta.y / max };

            const newHighlightedIndicies = times(max + 1, i => {
                const x = firstClicked.x + i * norm.x;
                const y = firstClicked.y + i * norm.y;
                return { x, y };
            });

            setHighlightedIndicies(newHighlightedIndicies);
            return;
        }
        setHighlightedIndicies([]);

    }, [firstClicked, currentHover])

    return <transformNode name='root' ref={rootRef} position={new Vector3(0, 0, 10000)}>
        <transformNode name="particleTransform" position={offset}>
            <Capsules solvedCoordinatePairs={solvedCoordinatePairs} crosswordDimensions={crosswordDimensions} />
            <CrosswordAudio selectedLength={highlightedIndicies.length} numWords={words.length} numCompletedWords={completedWords.length} />
            <CrosswordLetters crosswordDimensions={crosswordDimensions} letterGrid={ws.grid} highlightedIndicies={highlightedIndicies} setFirstClicked={setFirstClicked} setCurrentHover={setCurrentHover} offset={offset} />
            <CrosswordList crosswordDimensions={crosswordDimensions} completedWords={completedWords} words={words} position={new Vector3((crosswordDimensions.x + 2.5) - crosswordDimensions.x / 2, crosswordDimensions.y / 2, 0)} iconRoot={iconRoot} offset={offset} />
        </transformNode>
    </transformNode>
}