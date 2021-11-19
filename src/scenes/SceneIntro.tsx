import { Animation, BoxParticleEmitter, GPUParticleSystem, Mesh, PowerEase, StandardMaterial, Vector3 } from '@babylonjs/core';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useClick, useScene } from 'react-babylonjs';
import { SceneComponent } from '../App';
import { CustomParticleSystemEngine } from '../components/particles.ts/CustomParticleSystemEngine';
import { _interacted } from '../hooks/useInteract';
import { useParticleLocations } from '../hooks/useParticleLocations';
import { introSound, playSound } from '../sounds/Sounds';

export const SceneIntro: SceneComponent = ({ transitionScene }) => {
    const scene = useScene()
    const planeRef = useRef<Mesh>(null);
    const planeRef2 = useRef<Mesh>(null);
    const [started, setStarted] = useState<boolean>(false)
    const wordParticleLocations = useParticleLocations(planeRef, 10000, 16, 2)

    useEffect(() => {
        if (!planeRef.current || !planeRef2.current) return;
        if (!scene) return;
        planeRef.current.isVisible = true;
        const material = (planeRef.current.material as StandardMaterial);
        const material2 = (planeRef2.current.material as StandardMaterial);
        material.backFaceCulling = false;
        material2.backFaceCulling = false;
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
            if (!planeRef2.current) return;
            planeRef2.current.isVisible = true;
            scene.beginDirectAnimation(material2, [animation], 0, 180, false, 2,);
        }, 6000)
    }, [scene])

    const engineAndParticleSystem = useMemo(() => {
        if (!scene || !wordParticleLocations) return;
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
        }, scene)

        const particleSystem = new GPUParticleSystem("particles", { capacity: 1000000 }, scene);
        particleSystem.activeParticleCount = 1000000;

        particleSystem.emitRate = 100000;
        particleSystem.particleEmitterType = new BoxParticleEmitter();
        particleSystem.maxEmitBox = new Vector3(-40, 40, 80);
        particleSystem.minEmitBox = new Vector3(40, -40, 0);
        particleSystem.direction1 = new Vector3(0, 0, -10);
        particleSystem.direction2 = new Vector3(0, 0, -10);
        particleSystem.particleTexture = new Texture("/textures/flare.png", scene);
        particleSystem.maxLifeTime = 10;
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.1;
        particleSystem.emitter = new Vector3(-1000000, -1000000, -1000000);
        particleSystem.start();
        return { engine, particleSystem };
    }, [scene, wordParticleLocations])

    useEffect(() => {
        if (!started || !scene || !wordParticleLocations || !engineAndParticleSystem || !planeRef.current || !planeRef2.current) return;

        planeRef.current.isVisible = false;
        planeRef2.current.isVisible = false;

        const { engine, particleSystem } = engineAndParticleSystem;
        engine.init();
        particleSystem.emitter = new Vector3(0, 0, 10);

        const animation = new Animation('', 'direction1', 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const animation2 = new Animation('', 'direction2', 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            {
                frame: 0,
                value: new Vector3(0, 0, -10)
            },
            {
                frame: 180,
                value: new Vector3(0, 0, -100)
            }
        ]
        animation.setKeys(keys);
        animation2.setKeys(keys);
        const easingFunction = new PowerEase(2);
        animation.setEasingFunction(easingFunction);
        animation2.setEasingFunction(easingFunction);
        scene.beginDirectAnimation(particleSystem, [animation, animation2], 0, 180, false, 1,);

        window.setTimeout(() => {
            transitionScene("intro", "menu", 10000)
            if (!particleSystem) return;
            particleSystem.stop();

        }, 10000)

    }, [engineAndParticleSystem, scene, started, transitionScene, wordParticleLocations])

    useEffect(() => {
        return () => {
            console.log("dispose")
            if (!engineAndParticleSystem) return;
            const { engine, particleSystem } = engineAndParticleSystem;
            engine.dispose();
            particleSystem.dispose();
        }
    }, [engineAndParticleSystem])

    useClick(() => {
        setStarted(true);
        playSound(introSound)
        _interacted.current = true;
    }, planeRef2)


    return <> <plane isVisible={false} width={16} height={2} ref={planeRef} name={`intro plane`} position={new Vector3(0, 0, 10)}>
        <advancedDynamicTexture
            assignTo={'emissiveTexture'}
            name='letterTexture'
            height={512} width={4096}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock name='cancel-text' text={"Crossword VR"} fontSize={512} fontStyle='bold' color={'white'} />
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
    </>
}
