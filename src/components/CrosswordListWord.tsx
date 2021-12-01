import { Mesh, Texture, Vector3 } from '@babylonjs/core';
import { Control } from '@babylonjs/gui/2D/controls/control';
import React, { useEffect, useRef, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { useParticleLocations } from '../hooks/useParticleLocations';
import { PARTICLES_PER_ICON } from '../scenes/SceneMenu';
import { CustomParticleSystemEngine } from './particles.ts/CustomParticleSystemEngine';

interface CrosswordListWordProps {
    word: string
    position: Vector3
    completed: boolean
    index: number
    iconRoot: string;
}

export const CrosswordListWord: React.FC<CrosswordListWordProps> = ({ iconRoot, word, position, completed, index }) => {
    const wordRef = useRef<Mesh>(null);
    const iconRef = useRef<Mesh>(null);

    const scene = useScene()

    const [iconReady, setIconReady] = useState(false);

    const wordParticleLocations = useParticleLocations({ word, text: true }, wordRef, PARTICLES_PER_ICON, 4, 1)
    const wordParticleTargets = useParticleLocations({ word, text: false }, iconRef, PARTICLES_PER_ICON, 1, 1, true, iconReady, position.add(new Vector3(index % 2 === 0 ? -1.5 : -0.5, 0, 0)).subtract(position))
    const [engine, setEngine] = useState<CustomParticleSystemEngine>();
    useEffect(() => {
        if (!scene || !wordParticleLocations || !wordParticleTargets || engine || !wordRef.current) return;
        const _engine = new CustomParticleSystemEngine({
            count: wordParticleLocations.length,
            minLifespan: -1,
            maxLifespan: -1,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 0, 1),
            direction2: new Vector3(-1, 0, -1),
            minVelocity: 5,
            maxVelocity: 10,
            initialPositions: wordParticleLocations,
            targets: wordParticleTargets,
            emitter: wordRef.current
        }, scene)
        setEngine(_engine)
    }, [engine, scene, wordParticleLocations, wordParticleTargets])

    useEffect(() => {
        if (!completed || !scene || !wordParticleLocations || !wordParticleTargets || !engine) return;
        engine.init();
    }, [completed, engine, scene, wordParticleLocations, wordParticleTargets])

    useEffect(() => {
        let lastEngine = engine
        return () => {
            if (lastEngine) lastEngine.dispose();
        }
    }, [engine])

    return <><plane isVisible={!completed} ref={wordRef} width={4} height={1} name={`word${position.toString()}`} position={position}>
        <advancedDynamicTexture
            name='dialogTexture'
            height={128} width={512}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={word} text={word} fontSize={80} fontStyle='bold' color='white' />
        </advancedDynamicTexture>
    </plane>
        <plane isVisible={false} ref={iconRef} width={1} height={1} name={word} position={position.add(new Vector3(index % 2 === 0 ? -1.5 : -0.5, 0, 0))}>
            <standardMaterial name='wordMaterial' disableLighting={true}>
                <texture onLoad={() => setIconReady(true)} name='wordTexture' assignTo="emissiveTexture" url={`/icons/${iconRoot}/${word}.png`} />
            </standardMaterial>
        </plane>
    </>
}
