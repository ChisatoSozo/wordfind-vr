import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import React from "react"
import { CrosswordListWord } from "./CrosswordListWord"

interface CrosswordListProps {
    words: string[]
    position: Vector3
    completedWords: string[]
    crosswordDimensions: { x: number, y: number }
    iconRoot: string;
}

export const CrosswordList: React.FC<CrosswordListProps> = ({ iconRoot, words, position, completedWords, crosswordDimensions }) => {
    return <>{words.map((word, i) => <CrosswordListWord index={i} iconRoot={iconRoot} word={word} key={word} completed={completedWords.includes(word.toUpperCase())} position={position.add(new Vector3(4 * (Math.floor(i / crosswordDimensions.y)), -(i % crosswordDimensions.y), 0))} />)}</>
}