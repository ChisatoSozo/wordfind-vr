import { clamp, take } from "lodash";
import { arabToRoman } from 'roman-numbers';
import seedrandom from 'seedrandom';
import { LevelDefinition, SceneName } from "../App";
import { wordListMap, WordListName } from "../words";

interface prng {
    (): number;
    double(): number;
    int32(): number;
    quick(): number;
    state(): seedrandom.State;
}


export interface LevelNode {
    levelDefinition: LevelDefinition
    children: LevelNode[]
    rank: number;
    icon: string;
    parent: LevelNode | null;
}

const DIFFICULTY_RAMP = 1.1;
const ASSYMETRY_CHANCE = 0.3;

const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const makeLevel = (scene: SceneName, wordListName: WordListName, levelNumber: number, rng: prng): LevelDefinition => {
    const difficulty = Math.log2(Math.max(levelNumber, 1)) * DIFFICULTY_RAMP + 1;
    const crosswordSize = 64 * difficulty;

    const isAssymetric = rng() < ASSYMETRY_CHANCE;

    let x = Math.sqrt(crosswordSize);
    if (isAssymetric) {
        const fourth = x / 4;
        x += fourth * (rng() * 2 - 1);
    }
    x = Math.floor(x);

    let y = Math.floor(crosswordSize / x);
    if (!isAssymetric) y = x


    const levelName = capitalizeFirstLetter(wordListName) + " " + arabToRoman(levelNumber + 1);

    return {
        scene,
        levelName,
        words: wordListMap[wordListName],
        crosswordDimensions: { x, y },
        iconRoot: wordListName
    }
}

const venues = ["particles"]

export const defaultNode = {
    levelDefinition: {
        scene: "particles",
        levelName: "Food I",
        words: take(wordListMap["food"], 2) as any,
        crosswordDimensions: { x: 8, y: 8 },
        iconRoot: "food",
    },
    rank: 0,
    icon: wordListMap["food"][0],
    children: [],
    parent: null
} as LevelNode

export const generateLevelGraph = (seed: string, maxWidth: number, depth: number) => {
    const rng = seedrandom(seed);

    let curWidth = 1;
    let levelCounts: { [key in WordListName]: number } = {
        art: 0,
        autumn: 0,
        christmas: 0,
        clothing: 0,
        desserts: 0,
        devices: 0,
        dogs: 0,
        farm: 0,
        flowers: 0,
        food: 1,
        furniture: 0,
        geography: 0,
        insects: 0,
        instruments: 0,
        ocean: 0,
        pirates: 0,
        plants: 0,
        reptiles: 0,
        shapes: 0,
        sports: 0,
        vehicles: 0,
    };

    const nodes: LevelNode[][] = [];

    const rootNode = defaultNode;

    nodes[0] = [];
    nodes[0].push(rootNode);

    for (let i = 0; i < depth; i++) {
        const newNodes: LevelNode[] = [];

        curWidth = clamp(curWidth + rng() * 2 - 1, 1, maxWidth);
        for (let j = 0; j < curWidth; j++) {
            const scene = venues[Math.floor(rng() * venues.length)] as SceneName;
            const wordListName = Object.keys(wordListMap)[Math.floor(rng() * Object.keys(wordListMap).length)] as WordListName;
            const level = makeLevel(scene, wordListName, levelCounts[wordListName], rng);

            const possibleParents = nodes[i];
            const parent = possibleParents[Math.floor(rng() * possibleParents.length)];

            const node = {
                levelDefinition: level,
                rank: i + 1,
                children: [],
                parent: parent,
                icon: wordListMap[wordListName][levelCounts[wordListName] % wordListMap[wordListName].length],
            } as LevelNode;

            parent.children.push(node);
            levelCounts[wordListName]++;
            newNodes.push(node);
        }

        nodes.push(newNodes);
    }

    return nodes;
}
