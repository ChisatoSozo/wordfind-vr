import { cookingWords } from "./cooking";
import { dogWords } from "./dogs";
import { plantWords } from "./plants";

export const wordListMap = {
    dogs: dogWords,
    food: cookingWords,
    plants: plantWords
} as const

export type WordListName = keyof typeof wordListMap;
export type WordList = (typeof wordListMap)[WordListName];