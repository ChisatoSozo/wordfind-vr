import { Color3, Mesh, Vector3 } from '@babylonjs/core'
import { TransformNode } from '@babylonjs/core/Meshes/transformNode'
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


const levelNodeRanks = generateLevelGraph(4, 50);
const names = levelNodeRanks.map(n => n.map(n => n.levelDefinition.levelName)).flat();
const nameMap: { [key: string]: boolean } = {};
names.forEach(n => nameMap[n] = true);

export const PARTICLES_PER_ICON = 1000;
export const completedNode: {
    current?: LevelNode
} = {}

const menuPosition = new Vector3(0, 0, 0);

export const SceneMenu: SceneComponent = ({ transitionScene, win }) => {
    const rootRef = React.useRef<Mesh>(null)
    const transformRef = React.useRef<TransformNode>(null)
    const scene = useScene();

    const [unlocked, setUnlocked] = useState(getLS("unlockedLevels"))
    const toBeUnlocked = useMemo(() => win && completedNode.current ? completedNode.current.children.map(child => child.levelDefinition.levelName) : [], [win])
    useEffect(() => {
        setLS("unlockedLevels", unlocked)
    }, [unlocked])

    useInteract(() => playSound(backgroundSound, 0.3, true));
    useSlideIn(transformRef, new Vector3(0, 0, 10))
    useDrag(rootRef)

    const [particleLocations, setParticleLocations] = useState<Vector3[]>([]);
    useEffect(() => {
        if (!particleLocations.length || particleLocations.length !== PARTICLES_PER_ICON * Object.keys(getLS("completedLevels")).length || !scene || !rootRef.current) return;
        const engine = new CustomParticleSystemEngine({
            initialPositions: particleLocations,
            count: particleLocations.length,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 1, 1),
            direction2: new Vector3(-1, -1, -1),
            minVelocity: 0.000000000000000001,
            maxVelocity: 0.000000000000000001,
            emitter: rootRef.current,
            color: new Color3(0.2, 1.0, 0.2),
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

    const levelClick = useCallback((node: LevelNode) => {
        completedNode.current = node;
        transitionScene("menu", node.levelDefinition.scene, 0, node.levelDefinition)
    }, [transitionScene])

    useEffect(() => {
        const plane = rootRef.current;
        return () => {
            if (!plane) return;
            menuPosition.copyFrom(plane.position)
        }
    }, [])

    return <transformNode ref={transformRef} name={`intro transformNode`} position={new Vector3(0, 0, 10000)}>
        <plane height={1000} width={100000} ref={rootRef} name={`intro transformNode`} position={menuPosition}>
            <standardMaterial name="background" alpha={0} />

            {
                levelNodeRanks.map((levelNodeRank, index) => <Fragment key={index}>
                    {levelNodeRank.map((node, index) => {
                        const completed = getLS('completedLevels')[node.levelDefinition.levelName]
                        const willBeUnlocked = toBeUnlocked.includes(node.levelDefinition.levelName)
                        const thisUnlocked = unlocked[node.levelDefinition.levelName]
                        return (willBeUnlocked || thisUnlocked) && <LevelIcon willBeUnlocked={willBeUnlocked} unlocked={thisUnlocked} key={index} node={node} onClick={levelClick} newParticles={newParticles} completed={completed} />
                    })}
                </Fragment>)
            }
        </plane>
    </transformNode>
}
