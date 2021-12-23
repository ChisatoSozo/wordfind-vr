import { Mesh, Texture, Vector3 } from '@babylonjs/core';
import { times } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHover } from 'react-babylonjs';
import { VenueComponent } from '../App';
import { Capsules } from '../components/Capsules';
import { CrosswordAudio } from '../components/CrosswordAudio';
import { CrosswordLetters } from '../components/CrosswordLetters';
import { CrosswordList } from '../components/CrosswordList';
import { useMouseUp } from '../forks/useMouse';
import { useSlideIn } from '../hooks/useSlideIn';
import { useWordSearch } from '../hooks/useWordSearch';
import { stopAllSounds } from '../sounds/Sounds';
import { getLS, setLS } from '../utils/LS';
import { completedNode } from './SceneMenu';

export const VenueParticles: VenueComponent = ({ crosswordDimensions, words: _words, iconRoot, transitionScene, song }) => {

    const offset = useMemo(() => new Vector3(-0.5 * crosswordDimensions.x, 0, 1.5 * Math.max(crosswordDimensions.y, crosswordDimensions.x)), [crosswordDimensions.x, crosswordDimensions.y]);
    const startPosition = useMemo(() => new Vector3(0, 0, 10000).add(offset), [offset]);
    const rootRef = useRef<Mesh>(null)
    useSlideIn(rootRef, new Vector3(0, 0, 0).add(offset))

    const ws = useWordSearch(crosswordDimensions, _words);
    const words = useMemo(() => [...new Set(ws.words.map(word => word.word))], [ws]);
    useEffect(() => {
        stopAllSounds();
    }, [])

    const [firstClicked, setFirstClicked] = useState<{ x: number, y: number } | null>(null);
    const [currentHover, setCurrentHover] = useState<{ x: number, y: number } | null>(null);

    const [completedWords, setCompletedWords] = useState<string[]>([]);
    const [solvedCoordinatePairs, setSolvedCoordinatePairs] = useState<[{ x: number, y: number }, { x: number, y: number }][]>([]);
    const [highlightedIndicies, setHighlightedIndicies] = useState<{ x: number, y: number }[]>([]);

    useEffect(() => {
        if (words.length === completedWords.length) {
            if (!completedNode.current) throw new Error("level not defined somehow")
            setLS('completedLevels', { ...getLS('completedLevels'), [completedNode.current?.levelDefinition.levelName]: true });
            window.setTimeout(() => {
                transitionScene("particles", "menu", 0, undefined, true)
            }, 2000);
        }
    }, [completedWords.length, transitionScene, words.length])

    useEffect(() => {
        if (!firstClicked && highlightedIndicies.length !== 0) {
            const word = highlightedIndicies.map(index => ws.grid[index.y][index.x]).join('');

            if (words.includes(word.toLowerCase()) && !completedWords.includes(word)) {
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

    const planeRef2 = useRef<Mesh>(null);
    const cancelPosition = useMemo(() => new Vector3(-(crosswordDimensions.x - 1) / 2, -crosswordDimensions.y / 2, -0.5), [crosswordDimensions.x, crosswordDimensions.y]);

    useMouseUp(() => {
        transitionScene("particles", "menu", 0, undefined, false)
    }, planeRef2)

    useMouseUp(() => {
        setFirstClicked(null);
    }, rootRef)

    const [backColor, setBackColor] = useState<string>("white");
    useHover(() => {
        setBackColor("green")
    }, () => {
        setBackColor("white")
    }, planeRef2)

    return <plane height={1000} width={100000} name='root' ref={rootRef} position={startPosition}>
        <standardMaterial name="background" alpha={0} />
        <Capsules solvedCoordinatePairs={solvedCoordinatePairs} crosswordDimensions={crosswordDimensions} />
        <CrosswordAudio song={song} selectedLength={highlightedIndicies.length} numWords={words.length} numCompletedWords={completedWords.length} />
        <CrosswordLetters crosswordDimensions={crosswordDimensions} letterGrid={ws.grid} highlightedIndicies={highlightedIndicies} setFirstClicked={setFirstClicked} setCurrentHover={setCurrentHover} parent={rootRef} />
        <CrosswordList crosswordDimensions={crosswordDimensions} completedWords={completedWords} words={words} position={new Vector3((crosswordDimensions.x + 2.5) - crosswordDimensions.x / 2, crosswordDimensions.y / 2, 0)} iconRoot={iconRoot} />
        <plane width={2} height={0.5} isPickable ref={planeRef2} name={`intro plane`} position={cancelPosition}>
            <advancedDynamicTexture
                assignTo={'emissiveTexture'}
                name='letterTexture'
                height={128} width={512}
                createForParentMesh
                generateMipMaps={true}
                samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
            >
                <textBlock name='cancel-text' text={"Give up"} fontSize={128} fontStyle='bold' color={backColor} />
            </advancedDynamicTexture>
        </plane>
    </plane>
}