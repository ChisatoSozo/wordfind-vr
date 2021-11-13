import { MeshBuilder, Polygon, TransformNode, Vector3 } from '@babylonjs/core'
import React, { useEffect, useRef } from 'react'
import { useScene } from 'react-babylonjs'

interface CapsuleProps {
    length: number;
    rotation: number;
    position: Vector3;
}

export const Capsule: React.FC<CapsuleProps> = ({ length, rotation, position }) => {
    const transformNodeRef = useRef<TransformNode>()
    const scene = useScene()

    useEffect(() => {
        if (!transformNodeRef.current || !scene) return;

        const circle = Polygon.Circle(0.5, 0, 0, 32);

        for (let i = 0; i < 16; i++) {
            circle[(24 + i) % 32].x += length;
        }

        const points = circle.map(p => new Vector3(p.x, p.y, 0));
        points.push(points[0])

        const lines = MeshBuilder.CreateLines("lines", { points }, scene);
        lines.parent = transformNodeRef.current;
    }, [length, scene])

    return <transformNode position={position} rotation-z={rotation} ref={transformNodeRef} name='' />
}