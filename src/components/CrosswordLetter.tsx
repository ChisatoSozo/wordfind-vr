import { Texture, Vector3 } from "@babylonjs/core";
import React, { useRef, useState } from "react";
import { useHover } from "react-babylonjs";
import { useMouseDown, useMouseUp } from "../forks/useMouse";

interface CrosswordLetterProps {
    letter: string;
    index: { x: number, y: number };
    crosswordDimensions: { x: number, y: number };

    setCurrentHover: (index: { x: number, y: number } | null) => void;
    setFirstClicked: (index: { x: number, y: number } | null) => void;

    highlighted: boolean;
}

export const CrosswordLetter: React.FC<CrosswordLetterProps> = ({ letter, index, crosswordDimensions, setCurrentHover, setFirstClicked, highlighted }) => {
    const [hovered, setHovered] = useState(false);

    const planeRef = useRef(null);
    useHover(
        () => {
            setHovered(true)
            setCurrentHover(index);
        },
        () => setHovered(false),
        planeRef
    );


    useMouseDown(
        () => {
            setFirstClicked(index);
        },
        planeRef
    );

    useMouseUp(
        () => {
            setFirstClicked(null);
        },
        planeRef
    )


    return <plane ref={planeRef} name={`plane${JSON.stringify(index)}`} position={new Vector3(index.x - crosswordDimensions.x / 2, -index.y + crosswordDimensions.y / 2, 0)}>
        <advancedDynamicTexture
            name='dialogTexture'
            height={256} width={256}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock name='cancel-text' text={letter} fontSize={256} fontStyle='bold' color={highlighted ? 'green' : hovered ? 'red' : 'white'} />
        </advancedDynamicTexture>
    </plane>
}