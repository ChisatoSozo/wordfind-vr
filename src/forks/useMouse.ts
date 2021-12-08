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


export function useMouseUp(onClick: MeshEventType, ownRef?: MutableRefObject<Nullable<Mesh>>, disable = false): [MutableRefObject<Nullable<Mesh>>] {
    const createdRef = useRef<Nullable<Mesh>>(null);
    const ref = ownRef ?? createdRef;

    useEffect(() => {
        if (ref.current && !disable) {
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
    }, [ref, disable]);
    // todo: if use ref.current as dep,  duplicate register action.

    return [ref];
}

/**
 * useClick hook
 * 
 * @param onClick What would be passed in the OnPickTrigger from ActionManager
 * @param ownRef to re-use a Ref you already have, otherwise one is created for you and returned.
 */
export function useClick(onClick: MeshEventType, ownRef?: MutableRefObject<Nullable<Mesh>>, disable = false): [MutableRefObject<Nullable<Mesh>>] {
    const createdRef = useRef<Nullable<Mesh>>(null);
    const ref = ownRef ?? createdRef;

    useEffect(() => {
        if (ref.current && !disable) {
            if (ref.current instanceof AbstractMesh) {
                const mesh = ref.current as Mesh;

                if (!mesh.actionManager) {
                    mesh.actionManager = new ActionManager(mesh.getScene());
                }

                const action: Nullable<IAction> = mesh.actionManager.registerAction(
                    new ExecuteCodeAction(
                        ActionManager.OnPickTrigger, function (ev: any) {
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
    }, [ref, disable]);
    // todo: if use ref.current as dep,  duplicate register action.

    return [ref];
}