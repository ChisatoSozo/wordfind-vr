import { Animation, EasingFunction, PowerEase, TransformNode, Vector3 } from '@babylonjs/core';
import { RefObject, useEffect } from 'react';
import { useScene } from 'react-babylonjs';

export const useSlideIn = (ref: RefObject<TransformNode>, to = new Vector3(0, 0, 0)) => {
    const scene = useScene();
    useEffect(() => {
        if (!ref.current) return;
        if (!scene) return;

        const animation = new Animation('', 'position', 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
        const keys = [
            {
                frame: 0,
                value: new Vector3(0, 0, 10000)
            },
            {
                frame: 60,
                value: to
            }
        ]
        animation.setKeys(keys);
        const easingFunction = new PowerEase(4);
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
        animation.setEasingFunction(easingFunction);
        scene.beginDirectAnimation(ref.current, [animation], 0, 60, false, 1,);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref, scene]);
}
