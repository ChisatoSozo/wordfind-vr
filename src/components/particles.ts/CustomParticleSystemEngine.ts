import { Mesh, MeshBuilder, Nullable, Observer, Scene, ShaderMaterial, TransformNode } from '@babylonjs/core';
import { Matrix, Vector3 } from '@babylonjs/core/Maths/math.vector';
import { flatten, times } from 'lodash';
import { MAX_VALUES_PER_FRAME } from '../../utils/constants';
import { makeTextureFromVectors, nextPowerOfTwo } from '../../utils/materialUtils';
import "./Behaviours";
import { CustomFloatProceduralTexture } from './CustomFloatProceduralTexture';
import { DifferentialTexture } from './DifferentialTexture';

interface CustomParticleSystemProps {
    count: number;
}

const MAX_MESH_IN_INSTANCES = 1024 * 1024;

const makeBuffer = () => {
    const buffer = new Float32Array(MAX_MESH_IN_INSTANCES * 16);
    const identity = Matrix.Identity();
    const sourceBuffer = identity.toArray()
    for (let i = 0; i < MAX_MESH_IN_INSTANCES * 16; i++) {
        const sourceIndex = i % 16;
        buffer[i] = sourceBuffer[sourceIndex];
    }
    return buffer
}

const bufferMatricesPreCompute = makeBuffer();

interface CustomParticleSystemEngineSettings {
    count: number
    minLifespan: number
    maxLifespan: number
    minSize: number
    maxSize: number
    direction1: Vector3
    direction2: Vector3
    minVelocity: number
    maxVelocity: number
    emitter: TransformNode
    gravity?: Vector3
    initialPositions?: Vector3[]
    targets?: Vector3[]
    debug?: boolean
}

type EmissionType = 'sphere' | 'locations'

const randomRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export class CustomParticleSystemEngine {
    private positionTexture: DifferentialTexture;
    private velocityTexture: DifferentialTexture;
    private shaderMaterial: ShaderMaterial;
    private planes: Mesh;

    private observable?: Nullable<Observer<Scene>>

    private currentIndex = 0;
    private active = false;
    public initialized = false;

    public emissionType: EmissionType = "sphere"
    public emitRadius = 1;
    public emitLocations: Vector3[] = [];

    constructor(private settings: CustomParticleSystemEngineSettings = {
        count: 5000,
        minLifespan: 0.3,
        maxLifespan: 1.5,
        minSize: 0.08,
        maxSize: 0.2,
        direction1: new Vector3(1, 1, 10),
        direction2: new Vector3(-1, -1, 10),
        minVelocity: 0.1,
        maxVelocity: 0.3,
        emitter: new TransformNode(""),
    }, private scene: Scene, fragmentShader = "particle") {
        const WIDTH = nextPowerOfTwo(Math.sqrt(settings.count));

        if (WIDTH > 1024) throw new Error('Too many particles');

        settings.direction1.normalize();
        settings.direction2.normalize();

        const positions = settings.initialPositions ? settings.initialPositions : times(settings.count, () => new Vector3(-100000, -100000, -100000));
        const velocities = times(settings.count, () => new Vector3(randomRange(settings.direction1.x, settings.direction2.x), randomRange(settings.direction1.y, settings.direction2.y), randomRange(settings.direction1.z, settings.direction2.z)).scale(randomRange(settings.minVelocity, settings.maxVelocity)));
        const lifespans = times(settings.count, () => 0);

        const initialPositionsTexture = makeTextureFromVectors(positions, scene, lifespans)
        const initialVelocitiesTexture = makeTextureFromVectors(velocities, scene, 0.)
        const targetsTexture = settings.targets && makeTextureFromVectors(settings.targets, scene, 0.)

        this.planes = MeshBuilder.CreatePlane('', { size: 1 });
        this.planes.parent = settings.emitter;

        this.planes.thinInstanceSetBuffer('matrix', bufferMatricesPreCompute.slice(0, settings.count * 16), 16, true);

        const setInitialUniforms = (texture: CustomFloatProceduralTexture) => {
            texture.setFloat('setValues', 0)
            texture.setFloats('setValuesFloats', times(MAX_VALUES_PER_FRAME * 3, () => 0))
            texture.setFloat('setValuesStart', 0)
            texture.setFloat('setValuesLength', 0)
            texture.setTexture('positionSampler', initialPositionsTexture);
            texture.setTexture('velocitySampler', initialVelocitiesTexture);
            texture.setVector3('gravity', settings.gravity || new Vector3(0.00001, 0.00001, 0.00001));
            texture.setVector3('offset', new Vector3(0.00001, 0.00001, 0.00001));
            targetsTexture && texture.setTexture('targetSampler', targetsTexture);
        }

        this.positionTexture = new DifferentialTexture(initialPositionsTexture, 'linearBehaviourPosition', scene, setInitialUniforms)
        this.velocityTexture = new DifferentialTexture(initialVelocitiesTexture, targetsTexture ? 'targetBehaviourVelocity' : 'linearBehaviourVelocity', scene, setInitialUniforms)

        this.shaderMaterial = new ShaderMaterial(
            "shader",
            scene,
            {
                vertex: "particle",
                fragment: fragmentShader,
            },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
                needAlphaBlending: true

            },

        );

        this.shaderMaterial.disableDepthWrite = true;
        this.shaderMaterial.backFaceCulling = false;

        this.shaderMaterial.setTexture("positionSampler", initialPositionsTexture)
        this.shaderMaterial.setTexture("velocitySampler", initialVelocitiesTexture)
        this.shaderMaterial.setFloat("minLifespan", settings.minLifespan);
        this.shaderMaterial.setFloat("maxLifespan", settings.maxLifespan);
        this.shaderMaterial.setFloat("minSize", settings.minSize);
        this.shaderMaterial.setFloat("maxSize", settings.maxSize);

        this.planes.material = this.shaderMaterial;
        this.planes.alwaysSelectAsActiveMesh = true;

        this.currentIndex = 0;

        this.planes.isVisible = false;
    }

    init() {
        this.planes.isVisible = true;
        this.initialized = true;

        this.observable = this.scene.onBeforeRenderObservable.add((scene) => {
            const deltaS = scene.deltaTime / 1000;
            if (this.settings.debug) {
                this.positionTexture.readPixelsAsync()?.then(console.log)
            }
            this.update(deltaS);
        });
    }

    dispose() {
        this.positionTexture.dispose()
        this.velocityTexture.dispose()
        this.shaderMaterial.dispose()
        this.planes.dispose()
        if (this.observable) this.scene.onBeforeRenderObservable.remove(this.observable);
    }

    start() {
        this.active = true;
    }

    stop() {
        this.active = false;
    }

    getEmitValues(count: number) {
        let vectors: Vector3[] = [];

        switch (this.emissionType) {
            case 'sphere':
                vectors = times(count, () => {
                    const x = Math.random() * 2 - 1;
                    const y = Math.random() * 2 - 1;
                    const z = Math.random() * 2 - 1;
                    const vec = new Vector3(x, y, z);
                    vec.normalize();
                    const c = Math.cbrt(Math.random());
                    return vec.scale(c * this.emitRadius);
                });
                break;
            case 'locations':
                vectors = times(count, () => {
                    const index = Math.floor(Math.random() * this.emitLocations.length);
                    const vec = this.emitLocations[index];
                    return vec
                });
                break;
        }

        //return vectors as an array of floats
        return flatten(vectors.map(v => [v.x, v.y, v.z]));
    }

    getEmitVelocityValues(count: number) {
        const vectors = times(count, () => new Vector3(randomRange(this.settings.direction1.x, this.settings.direction2.x), randomRange(this.settings.direction1.y, this.settings.direction2.y), randomRange(this.settings.direction1.z, this.settings.direction2.z)).scale(randomRange(this.settings.minVelocity, this.settings.maxVelocity)));
        //return vectors as an array of floats
        return flatten(vectors.map(v => [v.x, v.y, v.z]));
    }

    update = (deltaS: number) => {
        this.planes.parent = this.settings.emitter;
        const newPositionTexture = this.positionTexture.update(deltaS, (texture: CustomFloatProceduralTexture) => {
            if (this.active) {
                texture.setFloat('setValues', 1)
                texture.setFloats('setValuesFloats', this.getEmitValues(MAX_VALUES_PER_FRAME))
                texture.setFloat('setValuesStart', this.currentIndex)
                texture.setFloat('setValuesLength', MAX_VALUES_PER_FRAME)
                if (this.currentIndex + MAX_VALUES_PER_FRAME * 2 >= this.settings.count) {
                    this.currentIndex = 0;
                }
                else {
                    this.currentIndex += MAX_VALUES_PER_FRAME;
                }
            }
            else {
                texture.setFloat('setValues', 0)
            }
        });

        const newVelocityTexture = this.velocityTexture.update(deltaS, (texture: CustomFloatProceduralTexture) => {
            if (this.active) {
                texture.setFloat('setValues', 1)
                texture.setFloats('setValuesFloats', this.getEmitVelocityValues(MAX_VALUES_PER_FRAME))
                texture.setFloat('setValuesStart', this.currentIndex)
                texture.setFloat('setValuesLength', MAX_VALUES_PER_FRAME)
                if (this.currentIndex + MAX_VALUES_PER_FRAME * 2 >= this.settings.count) {
                    this.currentIndex = 0;
                }
                else {
                    this.currentIndex += MAX_VALUES_PER_FRAME;
                }
            }
            else {
                texture.setFloat('setValues', 0)
            }
        });

        if (newPositionTexture) {
            this.shaderMaterial.setTexture("positionSampler", newPositionTexture);
            this.velocityTexture.setTexture("positionSampler", newPositionTexture);
        }
        if (newVelocityTexture) {
            this.shaderMaterial.setTexture("velocitySampler", newVelocityTexture);
            this.positionTexture.setTexture("velocitySampler", newVelocityTexture);
        }
    }
}
