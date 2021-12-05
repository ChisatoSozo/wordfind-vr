import { Effect } from "@babylonjs/core";
import { glsl } from "./Common";

Effect.ShadersStore.redFragmentShader = glsl`
    precision highp float;
    varying vec2 vUV;
    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
`

Effect.ShadersStore.particleFragmentShader = glsl`
    precision highp float;
    varying vec2 vUV;
    varying vec4 vPosition;
    varying float lifeLeft;
    uniform sampler2D textureSampler;
    uniform vec3 color;
    void main(void) {
        float x = vUV.x * 2.0 - 1.0;
        float y = vUV.y * 2.0 - 1.0;
        float alpha = float(vPosition.x > -100000.) * (1.0 - (x * x + y * y));
        alpha = clamp(alpha, 0.0, 1.0);
        float cLifeLeft = clamp(lifeLeft, 0.0, 1.0);
        vec4 colorOut = texture2D(textureSampler, vUV);
        colorOut.a *= cLifeLeft * float(vPosition.x > -100000.);
        colorOut.rgb *= color;
        gl_FragColor = colorOut;
    }
`