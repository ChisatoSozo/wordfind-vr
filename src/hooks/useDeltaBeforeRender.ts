import { Scene } from '@babylonjs/core';
import { useEffect } from 'react';
import { useBeforeRender } from 'react-babylonjs';

type BeforeRenderFunc = (scene: Scene, deltaS: number) => void;

interface PriorityCallback {
    callback: BeforeRenderFunc,
    priority: number
}

const priorityCallbacks: { current: PriorityCallback[] } = {
    current: []
}

let setup = false;

export const setupDeltaPriority = (scene: Scene) => {
    scene.onBeforeRenderObservable.add(scene => {
        const deltaS = scene.getEngine().getDeltaTime() / 1000;
        for (const priorityCallback of priorityCallbacks.current) {
            priorityCallback.callback(scene, deltaS);
        }
    })
    setup = true;
}



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDeltaPriorityBeforeRender = (callback: BeforeRenderFunc, dependencyArray: any[], priority = Number.MAX_SAFE_INTEGER) => {
    useEffect(() => {
        if (!setup) throw new Error("You forgot to setup the priority callback system")
        const newCallback: PriorityCallback = {
            callback,
            priority,
        };

        const newCallbacks = [];
        let inserted = false;
        for (const priorityCallback of priorityCallbacks.current) {
            if (priorityCallback.priority > newCallback.priority && inserted === false) {
                newCallbacks.push(newCallback, priorityCallback);
                inserted = true;
                continue;
            }
            newCallbacks.push(priorityCallback);
        }

        if (inserted === false) {
            newCallbacks.push(newCallback)
        }

        priorityCallbacks.current = newCallbacks;

        return () => {
            const index = priorityCallbacks.current.indexOf(newCallback)
            priorityCallbacks.current.splice(index, 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priority, ...dependencyArray]);
};

export const useStatelessDeltaPriorityBeforeRender = (callback: BeforeRenderFunc, priority = Number.MAX_SAFE_INTEGER) => {
    useEffect(() => {
        if (!setup) throw new Error("You forgot to setup the priority callback system")
        const newCallback: PriorityCallback = {
            callback,
            priority,
        };

        const newCallbacks = [];
        let inserted = false;
        for (const priorityCallback of priorityCallbacks.current) {
            if (priorityCallback.priority > newCallback.priority && inserted === false) {
                newCallbacks.push(newCallback, priorityCallback);
                inserted = true;
                continue;
            }
            newCallbacks.push(priorityCallback);
        }

        if (inserted === false) {
            newCallbacks.push(newCallback)
        }

        priorityCallbacks.current = newCallbacks;

        return () => {
            const index = priorityCallbacks.current.indexOf(newCallback)
            priorityCallbacks.current.splice(index, 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};


export const useDeltaBeforeRender = (callback: BeforeRenderFunc) => {
    useBeforeRender((scene) => {
        const deltaS = scene.getEngine().getDeltaTime() / 1000;
        callback(scene, deltaS);
    });
}