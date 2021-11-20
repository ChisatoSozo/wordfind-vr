import { Vector3 } from "@babylonjs/core";
import { Capsule } from "./Capsule";



interface CapsulesProps {
    solvedCoordinatePairs: [{ x: number, y: number }, { x: number, y: number }][]
    crosswordDimensions: { x: number, y: number };
}

export const Capsules: React.FC<CapsulesProps> = ({ solvedCoordinatePairs, crosswordDimensions }) => {
    return <>{solvedCoordinatePairs.map(pair => {
        const length = Math.sqrt(Math.pow(pair[1].x - pair[0].x, 2) + Math.pow(pair[1].y - pair[0].y, 2));
        const angle = Math.atan2(pair[1].y - pair[0].y, pair[1].x - pair[0].x);

        const position = new Vector3(pair[0].x - (crosswordDimensions.x / 2), -pair[0].y + (crosswordDimensions.y / 2), 0);

        return <Capsule position={position} length={length} rotation={-angle} key={`${pair[0].x}-${pair[0].y}-${pair[1].x}-${pair[1].y}`} />
    })}</>
}
