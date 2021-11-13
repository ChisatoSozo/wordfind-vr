import { DefaultRenderingPipeline } from '@babylonjs/core';
import { useEffect } from 'react';
import { useScene } from 'react-babylonjs';

export const Pipeline = () => {
    const scene = useScene()

    useEffect(() => {
        if (!scene) return;
        const pipeline = new DefaultRenderingPipeline(
            "defaultPipeline", // The name of the pipeline
            true, // Do you want the pipeline to use HDR texture?
            scene, // The scene instance
        );

        pipeline.samples = 4;
    }, [scene])

    return null;
}
