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
    varying float instance;
    uniform sampler2D textureSampler;
    uniform vec3 color;
    uniform float time;

    // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
    uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
    }



    // Compound versions of the hashing algorithm I whipped together.
    uint hash( uvec2 v ) { return hash( v.x ^ hash(v.y)                         ); }
    uint hash( uvec3 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z)             ); }
    uint hash( uvec4 v ) { return hash( v.x ^ hash(v.y) ^ hash(v.z) ^ hash(v.w) ); }



    // Construct a float with half-open range [0:1] using low 23 bits.
    // All zeroes yields 0.0, all ones yields the next smallest representable value below 1.0.
    float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32

        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0

        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
    }



    // Pseudo-random value in half-open range [0:1].
    float random( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }

    void main(void) {
        float x = vUV.x * 2.0 - 1.0;
        float y = vUV.y * 2.0 - 1.0;

        float alpha = float(vPosition.x > -100000.) * (1.0 - (x * x + y * y));
        alpha = clamp(alpha, 0.0, 1.0);
        float cLifeLeft = clamp(lifeLeft, 0.0, 1.0);
        vec4 colorOut = texture2D(textureSampler, vUV);
        colorOut.a *= cLifeLeft * float(vPosition.x > -100000.) * ((sin(time*2. + instance)/2.0) + 0.5);
        colorOut.rgb *= color * 1.2;
        gl_FragColor = colorOut;
    }
`