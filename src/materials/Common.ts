import { Effect } from "@babylonjs/core";

export const glsl = (template: TemplateStringsArray, ...args: (string | number)[]) => {
    let str = '';
    for (let i = 0; i < args.length; i++) {
        str += template[i] + String(args[i]);
    }
    return str + template[template.length - 1];
};

Effect.ShadersStore.particleVertexShader = glsl`    
    #include<instancesDeclaration>
    // Attributes
    attribute vec3 position;
    attribute vec2 uv;
    // Uniforms
    uniform sampler2D positionSampler;
    uniform sampler2D maxLifespansSampler;
    uniform mat4 worldViewProjection;
    uniform mat4 view;

    uniform float maxSize;
    uniform float minSize;
    uniform float minLifespan;
    uniform float maxLifespan;

    // Varying
    varying vec2 vUV;
    varying vec4 vPosition;

    varying float lifeLeft;

    void makeRotation(in vec3 direction, out mat3 rotation)
    {
        vec3 xaxis = cross(vec3(0., 1., 0.), direction);
        xaxis = normalize(xaxis);

        vec3 yaxis = cross(direction, xaxis);
        yaxis = normalize(yaxis);

        rotation = mat3(xaxis, yaxis, direction);
    }

    // A single iteration of Bob Jenkins' One-At-A-Time hashing algorithm.
    uint hash( uint x ) {
        x += ( x << 10u );
        x ^= ( x >>  6u );
        x += ( x <<  3u );
        x ^= ( x >> 11u );
        x += ( x << 15u );
        return x;
    }


    float floatConstruct( uint m ) {
        const uint ieeeMantissa = 0x007FFFFFu; // binary32 mantissa bitmask
        const uint ieeeOne      = 0x3F800000u; // 1.0 in IEEE binary32
    
        m &= ieeeMantissa;                     // Keep only mantissa bits (fractional part)
        m |= ieeeOne;                          // Add fractional part to 1.0
    
        float  f = uintBitsToFloat( m );       // Range [1:2]
        return f - 1.0;                        // Range [0:1]
    }

    float random( float x ) { return floatConstruct(hash(floatBitsToUint(x))); }

    float randomRange( float seed, float minNum, float maxNum ) { 
        return random( seed ) * ( maxNum - minNum ) + minNum;
    }

    void main(void) {
        int instance = gl_InstanceID;
        int width = textureSize(positionSampler, 0).x;
        int x = instance % width;
        int y = instance / width;                            // integer division
        float u = (float(x) + 0.5) / float(width);           // map into 0-1 range
        float v = (float(y) + 0.5) / float(width);
        vec4 instPos = texture(positionSampler, vec2(u, v));

        float maxLife = randomRange(float(instance), minLifespan, maxLifespan + 0.0001);
        float size = randomRange(float(instance), minSize, maxSize + 0.0001);

        vec4 outPosition = worldViewProjection * vec4(position * size + instPos.xyz, 1.0);
        gl_Position = outPosition;
        vPosition = outPosition;
        lifeLeft = float(maxLifespan > 0.) * (maxLife - instPos.w) + float(maxLifespan < 0.) * 10.;
        vUV = uv;
    }
`