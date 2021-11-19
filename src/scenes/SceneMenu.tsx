import { TransformNode, Vector3 } from '@babylonjs/core'
import React, { Fragment } from 'react'
import { SceneComponent } from '../App'
import { LevelIcon } from '../components/LevelIcon'
import { useInteract } from '../hooks/useInteract'
import { useSlideIn } from '../hooks/useSlideIn'
import { backgroundSound, playSound } from '../sounds/Sounds'
import { generateLevelGraph, LevelNode } from '../utils/generateLevelGraph'

const SEED = 'seed';
const levelNodeRanks = generateLevelGraph(SEED, 4, 30);

const getNodePosition = (node: LevelNode, nodeCount: number, index: number) => {
    const yOffset = ((nodeCount - 1) / 2) - index;
    const xOffset = node.rank - 2
    return new Vector3(xOffset, yOffset, 0).scale(2);
}

export const SceneMenu: SceneComponent = ({ transitionScene }) => {
    const transformNodeRef = React.useRef<TransformNode>(null)

    useInteract(() => playSound(backgroundSound, 0.3, true));
    useSlideIn(transformNodeRef, new Vector3(0, 0, 10))

    return <transformNode ref={transformNodeRef} name={`intro transformNode`} position={new Vector3(0, 0, 10000)}>
        {
            levelNodeRanks.map((levelNodeRank, index) => {
                const nodeCount = levelNodeRank.length;
                return <Fragment key={index}>
                    {levelNodeRank.map((node, index) => {
                        const position = getNodePosition(node, nodeCount, index);
                        const onClick = () => {
                            transitionScene("menu", node.levelDefinition.scene, 0, node.levelDefinition)
                        }

                        return <LevelIcon key={index} position={position} node={node} onClick={onClick} />
                    })}
                </Fragment>
            })
        }
    </transformNode>
}
