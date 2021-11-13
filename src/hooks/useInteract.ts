import React, { useCallback, useEffect } from 'react'

export const useInteract = (callback: ((() => () => void) | (() => void))) => {
    const [interacted, setInteracted] = React.useState(false)
    useEffect(() => {
        const onInteract = () => setInteracted(true)
        window.addEventListener('click', onInteract)
        return () => window.removeEventListener('click', onInteract)
    }, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const realCallback = useCallback(callback, [])
    useEffect(() => {
        if (!interacted) return
        realCallback()
    }, [interacted, realCallback])
}
