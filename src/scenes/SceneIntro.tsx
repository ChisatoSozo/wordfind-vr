import { Animation, Mesh, PowerEase, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { random, times } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useClick, useScene } from 'react-babylonjs';
import { SceneComponent } from '../App';
import { CustomParticleSystemEngine } from '../components/particles.ts/CustomParticleSystemEngine';
import { _interacted } from '../hooks/useInteract';
import { useParticleLocations } from '../hooks/useParticleLocations';
import { introSound, playSound } from '../sounds/Sounds';
import { defaultNode } from '../utils/generateLevelGraph';
import { defaultLS, getLS } from '../utils/LS';
import { completedNode } from './SceneMenu';

export const SceneIntro: SceneComponent = ({ transitionScene }) => {
    const scene = useScene()
    const planeRef = useRef<Mesh>(null);
    const planeRef2 = useRef<Mesh>(null);
    const planeRef3 = useRef<Mesh>(null);
    const [started, setStarted] = useState<boolean>(false)
    const wordParticleLocations = useParticleLocations(undefined, planeRef, 10000, 16, 2)

    useEffect(() => {
        if (!planeRef.current || !planeRef2.current || !planeRef3.current) return;
        if (!scene) return;
        planeRef.current.isVisible = true;
        const material = (planeRef.current.material as StandardMaterial);
        const material2 = (planeRef2.current.material as StandardMaterial);
        const material3 = (planeRef3.current.material as StandardMaterial);
        material.backFaceCulling = false;
        material2.backFaceCulling = false;
        material3.backFaceCulling = false;
        const animation = new Animation('wordAlpha', 'alpha', 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
        animation.setKeys([
            {
                frame: 0,
                value: 0
            },
            {
                frame: 180,
                value: 1
            }
        ]);
        const easingFunction = new PowerEase(10);
        animation.setEasingFunction(easingFunction);
        scene.beginDirectAnimation(material, [animation], 0, 180, false, 1,);
        window.setTimeout(() => {
            if (!planeRef2.current || !planeRef3.current) return;
            planeRef2.current.isVisible = true;
            planeRef3.current.isVisible = true;
            scene.beginDirectAnimation(material2, [animation], 0, 180, false, 2,);
            scene.beginDirectAnimation(material3, [animation], 0, 180, false, 2,);
        }, 6000)
    }, [scene])

    const engineAndParticleSystem = useMemo(() => {
        if (!scene || !wordParticleLocations || !planeRef.current) return;
        const engine = new CustomParticleSystemEngine({
            count: wordParticleLocations.length,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 1, 2),
            direction2: new Vector3(-1, -1, 0),
            minVelocity: 0.5,
            maxVelocity: 1,
            gravity: new Vector3(0, 0, -1),
            initialPositions: wordParticleLocations,
            emitter: planeRef.current
        }, scene)

        const washParticleCount = 1000000;
        const initialPositions = times(washParticleCount, () => new Vector3(random(-50, 50, true), random(-50, 50, true), random(50, 150, true)))

        const engineWash = new CustomParticleSystemEngine({
            count: washParticleCount,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(0, 0, -10),
            direction2: new Vector3(0, 0, -10),
            minVelocity: 0.000000000000000001,
            maxVelocity: 0.000000000000000001,
            minZ: -50,
            maxZ: 50,
            gravity: new Vector3(0, 0, -2),
            initialPositions: initialPositions,
            emitter: planeRef.current
        }, scene)


        return { engine, engineWash };
    }, [scene, wordParticleLocations])

    useEffect(() => {
        if (!started || !scene || !wordParticleLocations || !engineAndParticleSystem || !planeRef.current || !planeRef2.current || !planeRef3.current) return;

        planeRef.current.isVisible = false;
        planeRef2.current.isVisible = false;
        planeRef3.current.isVisible = false;

        const { engine, engineWash } = engineAndParticleSystem;
        engine.init();
        engineWash.init();

        window.setTimeout(() => {
            engineWash.setFloat('minZ', -1000000);
            if (JSON.stringify(getLS("unlockedLevels")) === JSON.stringify(defaultLS.unlockedLevels)) {
                completedNode.current = defaultNode;
                transitionScene("intro", "particles", 10000)
            }
            else {
                transitionScene("intro", "menu", 10000)
            }
        }, 10000)

    }, [engineAndParticleSystem, scene, started, transitionScene, wordParticleLocations])

    useEffect(() => {
        return () => {
            if (!engineAndParticleSystem) return;
            const { engine, engineWash } = engineAndParticleSystem;
            engine.dispose();
            engineWash.dispose();
        }
    }, [engineAndParticleSystem])

    useClick(() => {
        setStarted(true);
        playSound(introSound)
        _interacted.current = true;
    }, planeRef2)
    useClick(() => {
        _interacted.current = true;
        if (JSON.stringify(getLS("unlockedLevels")) === JSON.stringify(defaultLS.unlockedLevels)) {
            completedNode.current = defaultNode;
            transitionScene("intro", "particles", 0)
        }
        else {
            transitionScene("intro", "menu", 0)
        }

    }, planeRef3)


    return <> <plane isVisible={false} width={16} height={2} ref={planeRef} name={`intro plane`} position={new Vector3(0, 0, 10)}>
        <advancedDynamicTexture
            assignTo={'emissiveTexture'}
            name='letterTexture'
            height={512} width={4096}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock name='cancel-text' text={"Wordfind VR"} fontSize={512} fontStyle='bold' color={'white'} />
        </advancedDynamicTexture>
    </plane>
        <plane isVisible={false} width={2} height={0.5} ref={planeRef2} name={`intro plane`} position={new Vector3(5.5, -1.3, 10)}>
            <advancedDynamicTexture
                assignTo={'emissiveTexture'}
                name='letterTexture'
                height={128} width={512}
                createForParentMesh
                generateMipMaps={true}
                samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
            >
                <textBlock name='cancel-text' text={"Start"} fontSize={128} fontStyle='bold' color={'white'} />
            </advancedDynamicTexture>
        </plane>
        <plane isVisible={false} width={2} height={0.5} ref={planeRef3} name={`intro plane`} position={new Vector3(-5.5, -1.3, 10)}>
            <advancedDynamicTexture
                assignTo={'emissiveTexture'}
                name='letterTexture'
                height={128} width={512}
                createForParentMesh
                generateMipMaps={true}
                samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
            >
                <textBlock name='cancel-text' text={"Skip Intro"} fontSize={96} fontStyle='bold' color={'white'} />
            </advancedDynamicTexture>
        </plane>
    </>
}
