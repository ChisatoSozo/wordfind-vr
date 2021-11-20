import { AbstractMesh, ActionManager, ExecuteCodeAction, IAction, Mesh, Nullable } from "@babylonjs/core";
import { MutableRefObject, useEffect, useRef } from "react";
import { MeshEventType } from "react-babylonjs";

export function useMouseDown(onClick: MeshEventType, ownRef?: MutableRefObject<Nullable<Mesh>>): [MutableRefObject<Nullable<Mesh>>] {
    const createdRef = useRef<Nullable<Mesh>>(null);
    const ref = ownRef ?? createdRef;

    useEffect(() => {
        if (ref.current) {
            if (ref.current instanceof AbstractMesh) {
                const mesh = ref.current as Mesh;

                if (!mesh.actionManager) {
                    mesh.actionManager = new ActionManager(mesh.getScene());
                }

                const action: Nullable<IAction> = mesh.actionManager.registerAction(
                    new ExecuteCodeAction(
                        ActionManager.OnPickDownTrigger, function (ev: any) {
                            onClick(ev);
                        }
                    )
                );
                return () => {
                    // unregister on teardown
                    mesh.actionManager?.unregisterAction(action!);
                }
            } else {
                console.warn('onClick hook only supports referencing Meshes');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);
    // todo: if use ref.current as dep,  duplicate register action.

    return [ref];
}


export function useMouseUp(onClick: MeshEventType, ownRef?: MutableRefObject<Nullable<Mesh>>): [MutableRefObject<Nullable<Mesh>>] {
    const createdRef = useRef<Nullable<Mesh>>(null);
    const ref = ownRef ?? createdRef;

    useEffect(() => {
        if (ref.current) {
            if (ref.current instanceof AbstractMesh) {
                const mesh = ref.current as Mesh;

                if (!mesh.actionManager) {
                    mesh.actionManager = new ActionManager(mesh.getScene());
                }

                const action: Nullable<IAction> = mesh.actionManager.registerAction(
                    new ExecuteCodeAction(
                        ActionManager.OnPickUpTrigger, function (ev: any) {
                            onClick(ev);
                        }
                    )
                );
                return () => {
                    // unregister on teardown
                    mesh.actionManager?.unregisterAction(action!);
                }
            } else {
                console.warn('onClick hook only supports referencing Meshes');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref]);
    // todo: if use ref.current as dep,  duplicate register action.

    return [ref];
}