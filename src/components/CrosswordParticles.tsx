import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import React, { useEffect } from 'react';
import { useScene } from 'react-babylonjs';
import { makeClickParticles } from './particles.ts/clickParticles';

interface CrosswordParticlesProps {
    highlightedIndicies: { x: number, y: number }[];
    crosswordDimensions: { x: number, y: number };
}

export const CrosswordParticles: React.FC<CrosswordParticlesProps> = ({ highlightedIndicies, crosswordDimensions }) => {
    const scene = useScene();

    useEffect(() => {
        if (highlightedIndicies.length === 0 || !scene) return;
        const index = highlightedIndicies[highlightedIndicies.length - 1];
        const position = new Vector3(index.x - crosswordDimensions.x / 2, -index.y + crosswordDimensions.y / 2)
        position.y -= 0.4;
        position.x -= 0.5;
        makeClickParticles(scene, position, position.add(new Vector3(1, 1, 0)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [highlightedIndicies.length])

    return null;
}
