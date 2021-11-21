import { Mesh, Vector3 } from '@babylonjs/core'
import { flatten } from 'lodash'
import React, { Fragment, useCallback, useEffect, useState } from 'react'
import { useScene } from 'react-babylonjs'
import { SceneComponent } from '../App'
import { LevelIcon } from '../components/LevelIcon'
import { CustomParticleSystemEngine } from '../components/particles.ts/CustomParticleSystemEngine'
import { useDrag } from '../forks/useDrag'
import { useInteract } from '../hooks/useInteract'
import { useSlideIn } from '../hooks/useSlideIn'
import { backgroundSound, playSound } from '../sounds/Sounds'
import { generateLevelGraph, LevelNode } from '../utils/generateLevelGraph'

const SEED = 'seed';
const levelNodeRanks = generateLevelGraph(SEED, 4, 3);
const numLevels = flatten([...levelNodeRanks]).length;

const getNodePosition = (node: LevelNode, nodeCount: number, index: number) => {
    const yOffset = ((nodeCount - 1) / 2) - index;
    const xOffset = node.rank - 2
    return new Vector3(xOffset, yOffset, 0).scale(2);
}

export const PARTICLES_PER_ICON = 1000;

export const SceneMenu: SceneComponent = ({ transitionScene }) => {
    const rootRef = React.useRef<Mesh>(null)
    const scene = useScene()

    useInteract(() => playSound(backgroundSound, 0.3, true));
    useSlideIn(rootRef, new Vector3(0, 0, 10))
    useDrag(rootRef)

    const [particleLocations, setParticleLocations] = useState<Vector3[]>([]);
    useEffect(() => {
        console.log(particleLocations)
        if (particleLocations.length !== PARTICLES_PER_ICON * numLevels || !scene || !rootRef.current) return;
        const engine = new CustomParticleSystemEngine({
            count: PARTICLES_PER_ICON * numLevels,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 1, 2),
            direction2: new Vector3(-1, -1, 0),
            minVelocity: 0.0001,
            maxVelocity: 0.0001,
            emitter: rootRef.current,
        }, scene);
        console.log(engine)
        engine.init();
    }, [particleLocations, scene])

    const newParticles = useCallback((newParticleLocations: Vector3[]) => {
        setParticleLocations(particleLocations => [...particleLocations, ...newParticleLocations]);
    }, [])

    return <plane height={1000} width={100000} ref={rootRef} name={`intro transformNode`} position={new Vector3(0, 0, 10000)}>
        <standardMaterial name="background" alpha={0} />
        {
            levelNodeRanks.map((levelNodeRank, index) => {
                const nodeCount = levelNodeRank.length;
                return <Fragment key={index}>
                    {levelNodeRank.map((node, index) => {
                        const position = getNodePosition(node, nodeCount, index);
                        const onClick = () => {
                            transitionScene("menu", node.levelDefinition.scene, 0, node.levelDefinition)
                        }

                        return <LevelIcon key={index} position={position} node={node} onClick={onClick} newParticles={newParticles} />
                    })}
                </Fragment>
            })
        }
    </plane>
}
