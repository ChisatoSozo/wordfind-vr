import { Mesh, Texture, Vector3 } from '@babylonjs/core'
import React from 'react'
import { useInteract } from '../hooks/useInteract'
import { useSlideIn } from '../hooks/useSlideIn'
import { backgroundSound, playSound } from '../sounds/Sounds'

export const SceneMenu = () => {
    const planeRef = React.useRef<Mesh>(null)

    useInteract(() => playSound(backgroundSound, 0.5, true));
    useSlideIn(planeRef, new Vector3(0, 0, 10))

    return <plane width={16} height={2} ref={planeRef} name={`intro plane`} position={new Vector3(0, 0, 10000)}>
        <advancedDynamicTexture
            assignTo={'emissiveTexture'}
            name='letterTexture'
            height={512} width={4096}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock name='cancel-text' text={"Temp Menu"} fontSize={512} fontStyle='bold' color={'white'} />
        </advancedDynamicTexture>
    </plane>
}
