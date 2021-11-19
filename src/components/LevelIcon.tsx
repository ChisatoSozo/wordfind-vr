import { Color3, Mesh, Vector3 } from '@babylonjs/core'
import React, { useRef } from 'react'
import { useClick } from 'react-babylonjs'
import { LevelNode } from '../utils/generateLevelGraph'

interface LevelNodeProps {
    node: LevelNode
    position: Vector3
    onClick: () => void
}

export const LevelIcon: React.FC<LevelNodeProps> = ({ node, position, onClick }) => {
    const planeRef = useRef<Mesh>(null)

    useClick(
        onClick,
        planeRef
    )

    return <plane ref={planeRef} name={`level ${node.levelDefinition.levelName}`} position={position}>
        <standardMaterial name='wordMaterial' emissiveColor={Color3.White()} disableLighting={true}>
            <texture name='wordTexture' assignTo="opacityTexture" url={`/icons/${node.levelDefinition.iconRoot}/${node.icon}.png`} />
        </standardMaterial>
    </plane>
}
