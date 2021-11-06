import { Texture } from "@babylonjs/core"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { Control } from "@babylonjs/gui/2D/controls/control"

interface CrosswordListProps {
    words: string[]
    position: Vector3
    completedWords: string[]
    crosswordDimensions: { x: number, y: number }
}

export const CrosswordList: React.FC<CrosswordListProps> = ({ words, position, completedWords, crosswordDimensions }) => {
    return <>{words.map((word, i) => <plane width={4} height={1} key={i} name={`word${position.toString()}`} position={position.add(new Vector3(4 * (Math.floor(i / crosswordDimensions.y)), -(i % crosswordDimensions.y), 0))}>
        <advancedDynamicTexture
            name='dialogTexture'
            height={128} width={512}
            createForParentMesh
            generateMipMaps={true}
            samplingMode={Texture.TRILINEAR_SAMPLINGMODE}
        >
            <textBlock textHorizontalAlignment={Control.HORIZONTAL_ALIGNMENT_LEFT} name={word} text={word} fontSize={80} fontStyle='bold' color={completedWords.includes(word.toUpperCase()) ? 'green' : 'white'} />
        </advancedDynamicTexture>
    </plane>)}</>
}