import { Constants, RawTexture, Scene, Texture, Vector2, Vector3 } from "@babylonjs/core";
import { makeTextureFromVectors, nextPowerOfTwo } from "../../utils/materialUtils";
import { CustomFloatProceduralTexture } from "./CustomFloatProceduralTexture";

const makeProceduralTexture = (name: string, shader: string, WIDTH: number, scene: Scene) => {
    const proceduralTexture = new CustomFloatProceduralTexture(
        name,
        shader,
        WIDTH,
        scene,
        undefined,
        false,
        false,
        Constants.TEXTURETYPE_FLOAT,
    );

    return proceduralTexture;
};

export class DifferentialTexture {
    private textures: CustomFloatProceduralTexture[];
    private initialTexture: RawTexture;

    private frame: number;
    private justStarted: boolean;

    constructor(initialValues: RawTexture | Vector3[], updateShader: string, scene: Scene, setInitialUniforms?: (texture: CustomFloatProceduralTexture) => void) {
        const WIDTH = (initialValues instanceof Texture) ? initialValues.getSize().width : nextPowerOfTwo(Math.sqrt(initialValues.length));

        if (WIDTH > 1024) throw new Error('Too many particles');
        this.initialTexture = (initialValues instanceof Texture) ? initialValues : makeTextureFromVectors(initialValues, scene);
        this.textures = [makeProceduralTexture("texture1", updateShader, WIDTH, scene), makeProceduralTexture("texture2", updateShader, WIDTH, scene)];

        this.textures.forEach(texture => {
            texture.setTexture("selfSampler", this.initialTexture);
            texture.setVector2('resolution', new Vector2(WIDTH, WIDTH));
            texture.setFloat('delta', 0.001);
            setInitialUniforms && setInitialUniforms(texture);
        })

        this.frame = 0;
        this.justStarted = true;
    }

    dispose() {
        this.textures.forEach(texture => texture.dispose());
        this.initialTexture.dispose();
    }

    setTexture(name: string, textureIn: CustomFloatProceduralTexture) {
        this.textures.forEach(texture => texture.setTexture(name, textureIn));
    }

    setVector3(name: string, vectorIn: Vector3) {
        this.textures.forEach(texture => texture.setVector3(name, vectorIn));
    }

    setFloat(name: string, value: number) {
        this.textures.forEach(texture => texture.setFloat(name, value));
    }

    readPixelsAsync = () => {
        return this.textures[this.frame % 2].readPixelsAsync();
    }

    update(deltaS: number, bindOtherUniforms?: (texture: CustomFloatProceduralTexture) => void) {
        if (
            this.textures.some((texture) => {
                return !texture.isReady();
            })
        ) {
            return;
        }

        if (this.justStarted) {
            this.justStarted = false;
            this.textures.forEach((texture) => {
                texture.isReady = () => true;
            });
        }

        const source = this.frame % 2;
        const dest = (this.frame + 1) % 2;

        this.textures[source].sleep = false;
        this.textures[dest].sleep = true;


        const bindSouceTextures = (destTexture: CustomFloatProceduralTexture) => {
            destTexture.setTexture('selfSampler', this.textures[source]);
            destTexture.setFloat('delta', deltaS);
            bindOtherUniforms && bindOtherUniforms(destTexture);
        };

        bindSouceTextures(this.textures[dest]);

        this.frame = (this.frame + 1) % 2;

        return this.textures[dest];
    }
}