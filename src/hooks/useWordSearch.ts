//@ts-ignore
import WordSearch from "@blex41/word-search";
import { useMemo } from "react";
import { cookingWordsWithIcons } from "../words/cooking";


const shuffle = (array: string[]) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}

interface WS {
    grid: string[][];
    words: {
        word: string,
        clean: string,
        path: { x: number, y: number }[]
    }[]
}

export const useWordSearch = (crosswordDimensions: { x: number, y: number }, words: number): WS => {
    return useMemo(() => {

        const options = {
            cols: crosswordDimensions.x,
            rows: crosswordDimensions.y,
            disabledDirections: ["N", "W", "NW", "SW"],
            dictionary: shuffle(cookingWordsWithIcons),
            maxWords: words,
            backwardsProbability: 0,
            upperCase: true,
            diacritics: false
        };

        return new WordSearch(options);
    }, [crosswordDimensions, words])
}