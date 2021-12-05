import { Vector3 } from '@babylonjs/core';
import { TransformNode } from '@babylonjs/core/Meshes/transformNode';
import { times } from 'lodash';
import React, { Dispatch, RefObject, SetStateAction, useCallback } from 'react';
import { useScene } from 'react-babylonjs';
import { CrosswordLetter } from './CrosswordLetter';
import { makeClickParticles } from './particles.ts/clickParticles';

interface CrosswordLettersProps {
    crosswordDimensions: { x: number, y: number };
    letterGrid: string[][];
    highlightedIndicies: { x: number, y: number }[];
    setFirstClicked: Dispatch<SetStateAction<{ x: number, y: number } | null>>;
    setCurrentHover: Dispatch<SetStateAction<{ x: number, y: number } | null>>;
    parent: RefObject<TransformNode>
}

export const CrosswordLetters: React.FC<CrosswordLettersProps> = ({ crosswordDimensions, letterGrid, highlightedIndicies, setFirstClicked, setCurrentHover, parent }) => {

    const scene = useScene();

    const addClickParticles = useCallback((locations: Vector3[]) => {
        if (highlightedIndicies.length === 0 || !scene) return;
        makeClickParticles(scene, locations, parent);
    }, [highlightedIndicies.length, parent, scene])

    return <>{times(crosswordDimensions.x, (x) => {
        return times(crosswordDimensions.y, (y) => {
            return <CrosswordLetter
                letter={letterGrid[y][x]}
                key={`${x}-${y}`}
                index={{ x, y }}
                crosswordDimensions={crosswordDimensions}
                highlighted={highlightedIndicies.some(i => i.x === x && i.y === y)}
                recentlyHighlighted={highlightedIndicies.length !== 0 && highlightedIndicies[highlightedIndicies.length - 1].x === x && highlightedIndicies[highlightedIndicies.length - 1].y === y}
                setCurrentHover={setCurrentHover}
                setFirstClicked={setFirstClicked}
                addClickParticles={addClickParticles}
            />
        })
    })}</>
}
