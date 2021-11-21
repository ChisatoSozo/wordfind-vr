import { Mesh, Vector3 } from '@babylonjs/core'
import React, { useEffect, useRef } from 'react'
import { useClick } from 'react-babylonjs'
import { useParticleLocations } from '../hooks/useParticleLocations'
import { PARTICLES_PER_ICON } from '../scenes/SceneMenu'
import { LevelNode } from '../utils/generateLevelGraph'

interface LevelNodeProps {
    node: LevelNode
    position: Vector3
    onClick: () => void
    newParticles: (particleLocations: Vector3[]) => void
}

export const LevelIcon: React.FC<LevelNodeProps> = ({ node, position, onClick, newParticles }) => {
    const planeRef = useRef<Mesh>(null)

    useClick(
        onClick,
        planeRef
    )

    const [textureReady, setTextureReady] = React.useState(false)

    const particleLocations = useParticleLocations(planeRef, PARTICLES_PER_ICON, 1, 1, true, textureReady)
    useEffect(() => {
        if (particleLocations && particleLocations.length > 0) {
            newParticles(particleLocations)
        }
    }, [newParticles, particleLocations])

    return <plane ref={planeRef} name={`level ${node.levelDefinition.levelName}`} position={position}>
        <standardMaterial name='wordMaterial' disableLighting={true}>
            <texture onLoad={() => setTextureReady(true)} name='wordTexture' assignTo="emissiveTexture" url={`/icons/${node.levelDefinition.iconRoot}/${node.icon}.png`} />
        </standardMaterial>
    </plane>
}
