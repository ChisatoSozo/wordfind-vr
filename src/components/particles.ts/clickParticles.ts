//@ts-nocheck
import { Scene, TransformNode, Vector3 } from '@babylonjs/core';
import { CustomParticleSystemEngine } from './CustomParticleSystemEngine';

const clickParticles: {
    current?: CustomParticleSystemEngine;
} = {}

const timer: {
    current?: number;
} = {}

export const makeClickParticles = (scene: Scene, locations: Vector3[], origin: TransformNode | RefObject<TransformNode> = new TransformNode("")) => {
    if (!clickParticles.current || clickParticles.current?.getIsDisposed()) {
        if (clickParticles.current) {
            clickParticles.current.dispose();
        }
        const engine = new CustomParticleSystemEngine({
            count: 5000,
            minLifespan: 0.3,
            maxLifespan: 1.5,
            minSize: 0.02,
            maxSize: 0.05,
            direction1: new Vector3(1, 1, 1),
            direction2: new Vector3(-1, -1, 1),
            minVelocity: 0.5,
            maxVelocity: 1,
            emitter: origin.current || origin
        }, scene)


        // Where the particles come from
        engine.emitRadius = 0.5;
        engine.emissionType = "locations"

        // // Direction of each particle after it has been emitted
        // engine.direction1 = new Vector3(0, 0, -10);
        // engine.direction2 = new Vector3(0, 0, -10);

        // // Speed
        // engine.minEmitPower = 1;
        // engine.maxEmitPower = 3;
        // engine.updateSpeed = 0.005;

        // engine.createSphereEmitter(0.5)

        engine.init();
        clickParticles.current = engine;
    }

    if (!clickParticles.current) return;


    clickParticles.current.settings.emitter = origin.current || origin;
    clickParticles.current.emitLocations = locations;

    clickParticles.current.start();

    if (timer.current) {
        window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(() => {
        if (!clickParticles.current) return;
        clickParticles.current.stop();
    }, 100)
}
