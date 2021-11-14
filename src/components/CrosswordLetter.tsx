import { Mesh, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useHover } from "react-babylonjs";
import { useMouseDown, useMouseUp } from "../forks/useMouse";

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

    const [wordParticleLocations, setWordParticleLocations] = useState<Vector3[]>()

    useEffect(() => {
        if (!planeRef.current) return;
        const letterMesh = planeRef.current;

        const texture = (letterMesh.material as StandardMaterial).emissiveTexture;

        if (!texture) return;

        const pixels = texture.readPixels() as Uint8Array;

        const particles: Vector3[] = [];

        while (particles.length < 1000) {
            const x = Math.floor(Math.random() * texture.getSize().width);
            const y = Math.floor(Math.random() * texture.getSize().height);
            if (pixels[(y * texture.getSize().width + x) * 4 + 3] !== 0) {
                const xPerc = x / texture.getSize().width;
                const yPerc = y / texture.getSize().height;
                const pos = new Vector3(xPerc - 0.5, yPerc - 0.5, 0).add(letterMesh.getAbsolutePosition());
                particles.push(pos);
            }
        }

        setWordParticleLocations(particles);
    }, []);

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