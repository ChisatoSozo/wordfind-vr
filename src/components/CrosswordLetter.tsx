import { Material, Mesh, Vector3 } from "@babylonjs/core";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useHover } from "react-babylonjs";
import { useMouseDown, useMouseUp } from "../forks/useMouse";
import { useParticleLocations } from "../hooks/useParticleLocations";
import { PARTICLES_PER_ICON } from "../scenes/SceneMenu";
import { CacheContext } from "./Cache";

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

    const letters = useContext(CacheContext)?.letters;
    const texture = useMemo(() => letters?.[letter], [letter, letters]);

    return <><plane ref={planeRef} name={`plane${JSON.stringify(index)}`} position={position}>
        <standardMaterial name='' alphaMode={Material.MATERIAL_ALPHABLEND} opacityTexture={texture} emissiveColor={highlighted ? Color3.Green() : hovered ? Color3.Red() : Color3.White()} disableLighting />
    </plane>
        <sphere ref={sphereRef} name={`sphere${JSON.stringify(index)}`} position={position}>
            <standardMaterial name="alpha" alpha={0} />
        </sphere>
    </>
}