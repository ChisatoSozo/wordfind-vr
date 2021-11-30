import { Color3, Mesh, Vector3 } from '@babylonjs/core'
import { shuffle } from 'lodash'
import React, { useEffect, useMemo, useRef } from 'react'
import { useClick, useScene } from 'react-babylonjs'
import { useParticleLocations } from '../hooks/useParticleLocations'
import { PARTICLES_PER_ICON } from '../scenes/SceneMenu'
import { newLevelSound, playSound } from '../sounds/Sounds'
import { LevelNode } from '../utils/generateLevelGraph'
import { CustomParticleSystemEngine } from './particles.ts/CustomParticleSystemEngine'

interface LevelNodeProps {
    node: LevelNode
    position: Vector3
    onClick: () => void
    newParticles: (particleLocations: Vector3[]) => void
    unlocked: boolean
    willBeUnlocked: boolean
}

export const LevelIcon: React.FC<LevelNodeProps> = ({ node, position, onClick, newParticles, unlocked, willBeUnlocked }) => {
    const planeRef = useRef<Mesh>(null)
    const scene = useScene()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const startedUnlocked = useMemo(() => unlocked, [])

    useClick(
        onClick,
        planeRef
    )

    const [textureReady, setTextureReady] = React.useState(false)
    const [engine, setEngine] = React.useState<CustomParticleSystemEngine>()

    let particleLocations = useParticleLocations(planeRef, PARTICLES_PER_ICON, 1, 1, true, textureReady, startedUnlocked ? position : new Vector3(0, 0, 0))
    useEffect(() => {
        if (particleLocations && particleLocations.length > 0 && unlocked) {
            newParticles(particleLocations)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newParticles, particleLocations])

    useEffect(() => {
        if (!unlocked && willBeUnlocked && particleLocations && particleLocations.length > 0 && planeRef.current && scene) {
            const _engine = new CustomParticleSystemEngine({
                count: particleLocations.length,
                minLifespan: -1,
                maxLifespan: -1,
                minSize: 0.02,
                maxSize: 0.05,
                direction1: new Vector3(1, 1, 1),
                direction2: new Vector3(-1, -1, -1),
                minVelocity: 5,
                maxVelocity: 10,
                initialPositions: particleLocations,
                targets: shuffle(particleLocations),
                emitter: planeRef.current
            }, scene)
            setEngine(_engine)
        }
    }, [unlocked, scene, particleLocations])
    useEffect(() => {
        if (engine && unlocked && particleLocations && particleLocations.length > 0) {
            playSound(newLevelSound)
            engine.init();
        }
    }, [unlocked, particleLocations, engine])

    return <plane ref={planeRef} name={`level ${node.levelDefinition.levelName}`} position={position}>
        <standardMaterial alpha={unlocked ? 0 : undefined} name='wordMaterial' disableLighting={true} emissiveColor={new Color3(0.2, 0.2, 0.2)}>
            <texture uScale={0.99} vScale={0.99} onLoad={() => setTextureReady(true)} name='wordTexture' assignTo="opacityTexture" url={`/icons/${node.levelDefinition.iconRoot}/${node.icon}.png`} />
        </standardMaterial>
    </plane>
}
