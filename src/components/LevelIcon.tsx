import { Color3, Mesh, Texture, Vector3 } from '@babylonjs/core'
import { Checkbox } from '@babylonjs/gui/2D/controls/checkbox'
import { Control } from '@babylonjs/gui/2D/controls/control'
import { shuffle, startCase } from 'lodash'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useHover, useScene } from 'react-babylonjs'
import { useClick } from '../forks/useMouse'
import { useParticleLocations } from '../hooks/useParticleLocations'
import { PARTICLES_PER_ICON } from '../scenes/SceneMenu'
import { newLevelSound, playSound } from '../sounds/Sounds'
import { LevelNode } from '../utils/generateLevelGraph'
import { setLS } from '../utils/LS'
import { CustomParticleSystemEngine } from './particles.ts/CustomParticleSystemEngine'

interface LevelNodeProps {
    node: LevelNode
    onClick: (node: LevelNode) => void
    newParticles: (particleLocations: Vector3[]) => void
    completed: boolean
    unlocked: boolean
    willBeUnlocked: boolean
    hoveredNode?: string
    setHoveredNode: React.Dispatch<React.SetStateAction<string | undefined>>
    playMusic: boolean
    setPlayMusic: React.Dispatch<React.SetStateAction<boolean>>
}

export const LevelIcon: React.FC<LevelNodeProps> = ({ playMusic, setPlayMusic, hoveredNode, setHoveredNode, node, onClick, newParticles, completed, unlocked, willBeUnlocked }) => {
    const planeRef = useRef<Mesh>(null)
    const scene = useScene()

    const hovered = useMemo(() => node.levelDefinition.levelName === hoveredNode, [hoveredNode, node.levelDefinition.levelName])

    useHover(() => {
        setHoveredNode(node.levelDefinition.levelName)
    }, () => { }, planeRef)

    useClick(
        () => onClick(node),
        planeRef,
        !unlocked
    )

    const [textureReady, setTextureReady] = React.useState(false)
    const [engine, setEngine] = React.useState<CustomParticleSystemEngine>()

    let particleLocations = useParticleLocations({ word: node.icon, text: false }, planeRef, PARTICLES_PER_ICON, 1, 1, true, textureReady, completed ? node.position : new Vector3(0, 0, 0))
    useEffect(() => {
        if (!scene) return;
        let _engine: CustomParticleSystemEngine;
        if (particleLocations && particleLocations.length > 0 && unlocked) {
            if (completed)
                newParticles(particleLocations)
            else {
                if (!planeRef.current) return;
                const _engine = new CustomParticleSystemEngine({
                    count: particleLocations.length,
                    minLifespan: -1,
                    maxLifespan: -1,
                    minSize: 0.02,
                    maxSize: 0.05,
                    direction1: new Vector3(0.00000000000000000001, 0.00000000000000000001, 0.00000000000000000001),
                    direction2: new Vector3(0.00000000000000000001, 0.00000000000000000001, 0.00000000000000000001),
                    minVelocity: 0.000000000000000000001,
                    maxVelocity: 0.000000000000000000001,
                    initialPositions: particleLocations,
                    emitter: planeRef.current
                }, scene)
                _engine.init()
            }
        }
        return () => {
            if (_engine) {
                _engine.dispose()
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newParticles, particleLocations, scene])

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
    }, [unlocked, scene, particleLocations, willBeUnlocked])
    useEffect(() => {
        if (engine && unlocked && particleLocations && particleLocations.length > 0) {
            playSound(newLevelSound)
            engine.init();
        }
    }, [unlocked, particleLocations, engine])

    const linePoints = useMemo(() => {
        if (node.children.length === 0) return;


        return node.children.map(child => {
            const start = node.position.clone().subtract(new Vector3(0, 0, -0.2));
            const end = child.position.clone().subtract(new Vector3(0, 0, -0.2));
            return [start, end]
        }).flat()

    }, [node.children, node.position])

    const lineColor = useMemo(() => {
        if (unlocked) {
            return Color3.FromHexString('#FFFFFF')
        }
        return Color3.FromHexString('#000000')
    }, [unlocked])

    const [checkboxRef, setCheckboxRef] = useState<Checkbox>();
    useEffect(() => {
        if (!checkboxRef) return;
        console.log("test mount")
        checkboxRef.onIsCheckedChangedObservable.add(checked => {
            console.log(
                "test", checked
            )
            setLS(`playMusic`, checked)
            setPlayMusic(checked);
        })
    }, [checkboxRef, setPlayMusic])

    return <><plane ref={planeRef} name={`level ${node.levelDefinition.levelName}`} position={node.position}>
        <standardMaterial diffuseColor={new Color3(0, 0, 0)} name='wordMaterial' disableLighting={true} emissiveColor={new Color3(0, 0, 0)}>
            {!unlocked && <texture uScale={0.99} vScale={0.99} onLoad={() => setTextureReady(true)} name='wordTexture' assignTo="opacityTexture" url={`${process.env.PUBLIC_URL}/icons/${node.levelDefinition.iconRoot}/${node.icon}.png`} />}
        </standardMaterial>
        {hovered && unlocked &&
            <>
                <plane isPickable={false} name='hover' width={4} height={2} position={new Vector3(1, -0.8, -0.1)}>
                    <advancedDynamicTexture
                        name='dialogTexture'
                        height={1024} width={2048}
                        createForParentMesh
                        generateMipMaps={true}
                        samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
                    >
                        <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={""} text={"Level: " + node.levelDefinition.levelName} fontSize={120} fontStyle='bold' color='white' />
                        <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={""} top={120} text={"Difficulty: " + Math.floor(Math.sqrt(node.levelDefinition.crosswordDimensions.x * node.levelDefinition.crosswordDimensions.y))} fontSize={120} fontStyle='bold' color='white' />
                        <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={""} top={240} text={"Song: " + startCase(node.levelDefinition.song)} fontSize={120} fontStyle='bold' color='white' />
                        <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={""} top={360} text={"Music: "} fontSize={120} fontStyle='bold' color='white' />
                    </advancedDynamicTexture>
                </plane>
                <plane name='hover' width={0.2} height={0.2} position={new Vector3(-0.1, -1.5, -0.1)}>
                    <advancedDynamicTexture
                        name='check'
                        height={128} width={128}
                        createForParentMesh
                        generateMipMaps={true}
                        samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
                    >
                        <checkbox name={""} widthInPixels={128} heightInPixels={128} color="green" isChecked={playMusic} ref={ref => setCheckboxRef(ref as Checkbox)} />
                    </advancedDynamicTexture>
                </plane>
            </>

        }
    </plane>
        {linePoints && completed && <lines color={lineColor} name={`level ${node.levelDefinition.levelName}`} points={linePoints} />}
    </>
}
