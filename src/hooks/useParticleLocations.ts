import { Mesh, StandardMaterial, Vector3 } from '@babylonjs/core';
import { RefObject, useEffect, useState } from 'react';

export const useParticleLocations = (meshRef: RefObject<Mesh>, num = 1000, width = 1, height = 1, onlyBlack = false, textureReady = true, offset?: Vector3) => {
    const [particleLocations, setParticleLocations] = useState<Vector3[]>()

    useEffect(() => {
        if (!meshRef.current || !textureReady) return;
        const letterMesh = meshRef.current;

        const texture = (letterMesh.material as StandardMaterial).emissiveTexture;

        if (!texture) return;

        const pixels = texture.readPixels() as Uint8Array;

        const particles: Vector3[] = [];

        while (particles.length < num) {
            const x = Math.floor(Math.random() * texture.getSize().width);
            const y = Math.floor(Math.random() * texture.getSize().height);
            if (pixels[(y * texture.getSize().width + x) * 4 + 3] !== 0 && (!onlyBlack || pixels[(y * texture.getSize().width + x) * 4] < 0.5)) {
                const xPerc = x / texture.getSize().width;
                const yPerc = y / texture.getSize().height;
                const pos = new Vector3(width * xPerc - width / 2, height * yPerc - height / 2, 0).add(offset || new Vector3(0, 0, 0));
                particles.push(pos);
            }
        }

        setParticleLocations(particles);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height, meshRef, num, onlyBlack, textureReady, width]);

    return particleLocations;
}
