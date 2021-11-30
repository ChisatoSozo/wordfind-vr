import { AbstractMesh, Mesh, Nullable, PointerDragBehavior, Vector3 } from "@babylonjs/core";
import { MutableRefObject, RefObject, useEffect, useRef } from "react";

export function useDrag(ownRef?: RefObject<Mesh>): [MutableRefObject<Nullable<Mesh>>] {
    const createdRef = useRef<Nullable<Mesh>>(null);
    const ref = ownRef ?? createdRef;

    useEffect(() => {
        if (ref.current) {
            if (ref.current instanceof AbstractMesh) {
                const mesh = ref.current as Mesh;

                const pointerDragBehavior = new PointerDragBehavior({ dragPlaneNormal: new Vector3(0, 0, 1) });
                mesh.addBehavior(pointerDragBehavior);
            } else {
                console.warn('drag hook only supports referencing Meshes');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);
    // todo: if use ref.current as dep,  duplicate register action.

    return [ref];
}