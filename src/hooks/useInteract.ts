import { useEffect, useMemo, useState } from 'react';

export const _interacted = {
    current: false
};

export const useInteract = <T>(callback: (() => T)) => {
    const [interacted, setInteracted] = useState(_interacted.current);

    useEffect(() => {
        if (!_interacted.current) {
            const _callback = () => {
                setInteracted(true)
                _interacted.current = true;
            }
            window.addEventListener('pointerdown', _callback)
            return () => window.removeEventListener('pointerdown', _callback)
        }
    }, [])

    return useMemo(() => {
        if (!interacted) return;
        return callback()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [interacted])
}
