import { Effect } from "@babylonjs/core";
import { glsl } from "../../materials";
import { MAX_VALUES_PER_FRAME } from "../../utils/constants";

Effect.ShadersStore['linearBehaviourPositionPixelShader'] = glsl`
    uniform float delta;
    uniform vec2 resolution;
    uniform sampler2D selfSampler;
    uniform sampler2D velocitySampler;

    uniform float setValues;
    uniform float setValuesFloats[${MAX_VALUES_PER_FRAME * 3}];
    uniform float setValuesStart;
    uniform float setValuesLength;

    void main()	{
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float id = (gl_FragCoord.x - 0.5) + ((gl_FragCoord.y - 0.5) * resolution.x);

        vec4 position = texture2D( selfSampler, uv );
        vec4 velocity = texture2D( velocitySampler, uv );

        vec4 outPosition =  vec4(position.xyz + (velocity.xyz * delta), position.w + delta);

        if(setValues > 0.0 && id >= setValuesStart && id < setValuesStart + setValuesLength) {
            int startIndex = int(id - setValuesStart) * 3;
            outPosition = vec4(setValuesFloats[startIndex], setValuesFloats[startIndex + 1], setValuesFloats[startIndex + 2], 0.);
        }
        
        gl_FragColor = outPosition;
    }
`;

const makeVelocityPixelShader = (velocityModifier: string, uniforms = ''): string => glsl`
    uniform float delta;
    uniform vec2 resolution;
    uniform sampler2D positionSampler;
    uniform sampler2D selfSampler;
    uniform vec3 gravity;

    ${uniforms}
    
    uniform float setValues;
    uniform float setValuesFloats[${MAX_VALUES_PER_FRAME * 3}];
    uniform float setValuesStart;
    uniform float setValuesLength;

    void main()	{
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        float id = (gl_FragCoord.x - 0.5) + ((gl_FragCoord.y - 0.5) * resolution.x);

        vec4 position = texture2D( positionSampler, uv );
        vec4 velocity = texture2D( selfSampler, uv );

        ${velocityModifier}
        outVelocity = outVelocity + vec4(gravity * delta, 0.);

        if(setValues > 0.0 && id >= setValuesStart && id < setValuesStart + setValuesLength) {
            int startIndex = int(id - setValuesStart) * 3;
            outVelocity = vec4(setValuesFloats[startIndex], setValuesFloats[startIndex + 1], setValuesFloats[startIndex + 2], 0.);
        }
        
        gl_FragColor = outVelocity;
    }
`

Effect.ShadersStore['linearBehaviourVelocityPixelShader'] = makeVelocityPixelShader(glsl`
    vec4 outVelocity =  velocity;
`)

Effect.ShadersStore['targetBehaviourVelocityPixelShader'] = makeVelocityPixelShader(glsl`
    vec3 newVelocity = velocity.xyz;

    vec3 target = texture2D(targetSampler, uv).xyz;
    vec3 direction = normalize(target - position.xyz);
    float dPosition = length(target - position.xyz);

    float drag = clamp(1./(dPosition + 0.0001), .4, 10000.);

    float multiplier = 1.0 - drag * delta;
    multiplier = clamp(multiplier, 0.0, 1.0);
    newVelocity = newVelocity * multiplier;

    newVelocity = newVelocity + (direction * delta * 1.0);

    vec4 outVelocity =  vec4(dPosition > 0.00001 ? newVelocity : vec3(0., 0., 0.), velocity.w);
`,
    glsl`
    uniform sampler2D targetSampler;
`)