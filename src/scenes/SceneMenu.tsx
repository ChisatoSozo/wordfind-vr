import { Mesh, Vector3 } from '@babylonjs/core'
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useScene } from 'react-babylonjs'
import { SceneComponent } from '../App'
import { LevelIcon } from '../components/LevelIcon'
import { CustomParticleSystemEngine } from '../components/particles.ts/CustomParticleSystemEngine'
import { useDrag } from '../forks/useDrag'
import { useInteract } from '../hooks/useInteract'
import { useSlideIn } from '../hooks/useSlideIn'
import { backgroundSound, playSound } from '../sounds/Sounds'
import { generateLevelGraph, LevelNode } from '../utils/generateLevelGraph'
import { getLS, setLS } from '../utils/LS'

const SEED = 'seed';
const levelNodeRanks = generateLevelGraph(SEED, 4, 50);

const getNodePosition = (node: LevelNode, nodeCount: number, index: number) => {
    const yOffset = ((nodeCount - 1) / 2) - index;
    const xOffset = node.rank - 2
    return new Vector3(xOffset, yOffset, 0).scale(2);
}

export const PARTICLES_PER_ICON = 1000;
export const completedNode: {
    current?: LevelNode
} = {}

export const SceneMenu: SceneComponent = ({ transitionScene, win }) => {
    const rootRef = React.useRef<Mesh>(null)
    const scene = useScene();

    const [unlocked, setUnlocked] = useState(getLS("unlockedLevels"))
    const toBeUnlocked = useMemo(() => win && completedNode.current ? completedNode.current.children.map(child => child.levelDefinition.levelName) : [], [win])
    useEffect(() => {
        setLS("unlockedLevels", unlocked)
    }, [unlocked])

    useInteract(() => playSound(backgroundSound, 0.3, true));
    useSlideIn(rootRef, new Vector3(0, 0, 10))
    useDrag(rootRef)

    const [particleLocations, setParticleLocations] = useState<Vector3[]>([]);
    useEffect(() => {
        if (particleLocations.length !== PARTICLES_PER_ICON * Object.keys(unlocked).length || !scene || !rootRef.current) return;
        const engine = new CustomParticleSystemEngine({
            initialPositions: particleLocations,
            count: particleLocations.length,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 1, 1),
            direction2: new Vector3(-1, -1, -1),
            minVelocity: 0.0001,
            maxVelocity: 0.0001,
            emitter: rootRef.current,
        }, scene);
        engine.init();
        return () => engine.dispose();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [particleLocations, scene])

    const doUnlock = useCallback((parentNode: LevelNode) => {
        window.setTimeout(() => {
            parentNode.children.forEach((childNode, i) => {
                window.setTimeout(() => {
                    setUnlocked(unlocked => ({ ...unlocked, [childNode.levelDefinition.levelName]: true }))
                }, i * 2000)
            })
        }, 3000)
    }, [])

    useEffect(() => {
        if (!completedNode.current || !win) return;
        window.setTimeout(() => {
            if (!completedNode.current) return;
            doUnlock(completedNode.current)
        }, 1000)
    }, [doUnlock, win])

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
                            completedNode.current = node;
                            transitionScene("menu", node.levelDefinition.scene, 0, node.levelDefinition)
                        }

                        const willBeUnlocked = toBeUnlocked.includes(node.levelDefinition.levelName)
                        const thisUnlocked = unlocked[node.levelDefinition.levelName]
                        return <LevelIcon willBeUnlocked={willBeUnlocked} unlocked={thisUnlocked} key={index} position={position} node={node} onClick={onClick} newParticles={newParticles} />
                    })}
                </Fragment>
            })
        }
    </plane>
}
