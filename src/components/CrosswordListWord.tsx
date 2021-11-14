import { Mesh, StandardMaterial, Texture, Vector3 } from '@babylonjs/core';
import { Control } from '@babylonjs/gui/2D/controls/control';
import React, { useEffect, useRef, useState } from 'react';
import { useScene } from 'react-babylonjs';
import { CustomParticleSystemEngine } from './particles.ts/CustomParticleSystemEngine';

interface CrosswordListWordProps {
    word: string
    position: Vector3
    completed: boolean
    index: number
}

export const CrosswordListWord: React.FC<CrosswordListWordProps> = ({ word, position, completed, index }) => {
    const wordRef = useRef<Mesh>();
    const iconRef = useRef<Mesh>();

    const scene = useScene()

    const [wordParticleLocations, setWordParticleLocations] = useState<Vector3[]>()
    const [wordParticleTargets, setWordParticleTargets] = useState<Vector3[]>()
    const [iconReady, setIconReady] = useState(false);
    const [engine, setEngine] = useState<CustomParticleSystemEngine>();

    useEffect(() => {
        if (!wordRef.current || !iconRef.current || !iconReady) return;
        const wordMesh = wordRef.current;
        const iconMesh = iconRef.current;

        const texture = (wordMesh.material as StandardMaterial).emissiveTexture;
        const iconTexture = (iconMesh.material as StandardMaterial).emissiveTexture;

        if (!texture) return;
        if (!iconTexture) return;

        const pixels = texture.readPixels() as Uint8Array;
        const iconPixels = iconTexture.readPixels() as Uint8Array;

        const particles: Vector3[] = [];
        const targets: Vector3[] = [];

        while (particles.length < 1000) {
            const x = Math.floor(Math.random() * texture.getSize().width);
            const y = Math.floor(Math.random() * texture.getSize().height);
            if (pixels[(y * texture.getSize().width + x) * 4 + 3] !== 0) {
                const xPerc = x / texture.getSize().width;
                const yPerc = y / texture.getSize().height;
                const pos = new Vector3(4 * xPerc - 2, yPerc - 0.5, 0).add(wordMesh.getAbsolutePosition());
                particles.push(pos);
            }
        }

        while (targets.length < 1000) {
            const x = Math.floor(Math.random() * iconTexture.getSize().width);
            const y = Math.floor(Math.random() * iconTexture.getSize().height);
            if (iconPixels[(y * iconTexture.getSize().width + x) * 4 + 3] !== 0 && iconPixels[(y * iconTexture.getSize().width + x) * 4] < 0.5) {
                const xPerc = x / iconTexture.getSize().width;
                const yPerc = y / iconTexture.getSize().height;
                const pos = new Vector3(xPerc - 0.5, yPerc - 0.5, 0).add(iconMesh.getAbsolutePosition());
                targets.push(pos);
            }
        }

        setWordParticleLocations(particles);
        setWordParticleTargets(targets);
    }, [iconReady]);

    useEffect(() => {
        if (!completed || !scene || !wordParticleLocations || !wordParticleTargets) return;
        const engine = new CustomParticleSystemEngine({
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
        }, scene)

        setEngine(engine);
    }, [completed, scene, wordParticleLocations, wordParticleTargets])

    useEffect(() => {
        return () => {
            if (engine) engine.dispose();
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
        <plane isVisible={false} ref={iconRef} width={1} height={1} name={`word${position.toString()}`} position={position.add(new Vector3(index % 2 === 0 ? -1.5 : -0.5, 0, 0))}>
            <standardMaterial name='wordMaterial' disableLighting={true}>
                <texture onLoad={() => setIconReady(true)} name='wordTexture' assignTo="emissiveTexture" url={`/icons/pancake.png`} />
            </standardMaterial>
        </plane>
    </>
}
