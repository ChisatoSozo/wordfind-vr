import { Mesh, Texture, Vector3 } from "@babylonjs/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHover } from "react-babylonjs";
import { useMouseDown, useMouseUp } from "../forks/useMouse";
import { useParticleLocations } from "../hooks/useParticleLocations";
import { PARTICLES_PER_ICON } from "../scenes/SceneMenu";

interface CrosswordLetterProps {
    letter: string;
    index: { x: number, y: number };
    crosswordDimensions: { x: number, y: number };

    setCurrentHover: (index: { x: number, y: number } | null) => void;
    setFirstClicked: (index: { x: number, y: number } | null) => void;

    highlighted: boolean;
    recentlyHighlighted: boolean;

    addClickParticles: (locaitons: Vector3[]) => void;
}

export const CrosswordLetter: React.FC<CrosswordLetterProps> = ({ letter, index, crosswordDimensions, setCurrentHover, setFirstClicked, highlighted, recentlyHighlighted, addClickParticles }) => {
    const [hovered, setHovered] = useState(false);

    const position = useMemo(() => new Vector3(index.x - crosswordDimensions.x / 2, -index.y + crosswordDimensions.y / 2, 0), [index, crosswordDimensions]);

    const sphereRef = useRef<Mesh>(null);
    const planeRef = useRef<Mesh>(null);

    useHover(
        () => {
            setHovered(true)
            setCurrentHover(index);
        },
        () => setHovered(false),
        sphereRef
    );


    useMouseDown(
        () => {
            setFirstClicked(index);
        },
        sphereRef
    );

    useMouseUp(
        () => {
            setFirstClicked(null);
        },
        sphereRef
    )

    const wordParticleLocations = useParticleLocations({ word: letter, text: true }, planeRef, PARTICLES_PER_ICON, 1, 1, undefined, undefined, position)

    useEffect(() => {
        if (!recentlyHighlighted || !wordParticleLocations) return;

        addClickParticles(wordParticleLocations);
    }, [wordParticleLocations, recentlyHighlighted, addClickParticles]);

    return <><plane ref={planeRef} name={`plane${JSON.stringify(index)}`} position={position}>
        <advancedDynamicTexture
            name='letterTexture'
            height={256} width={256}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock name='cancel-text' text={letter} fontSize={256} fontStyle='bold' color={highlighted ? 'green' : hovered ? 'red' : 'white'} />
        </advancedDynamicTexture>
    </plane>
        <sphere ref={sphereRef} name={`sphere${JSON.stringify(index)}`} position={position}>
            <standardMaterial name="alpha" alpha={0} />
        </sphere>
    </>
}