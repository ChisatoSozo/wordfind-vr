import { artWords } from "./art";
import { autumnWords } from "./autumn";
import { christmasWords } from "./christmas";
import { clothingWords } from "./clothing";
import { cookingWords } from "./cooking";
import { dessertWords } from "./desserts";
import { deviceWords } from "./devices";
import { dogWords } from "./dogs";
import { farmWords } from "./farm";
import { flowerWords } from "./flowers";
import { furnitureWords } from "./furniture";
import { geographyWords } from "./geography";
import { insectWords } from "./insects";
import { instrumentWords } from "./instruments";
import { oceanWords } from "./ocean";
import { pirateWords } from "./pirates";
import { plantWords } from "./plants";
import { reptileWords } from "./reptiles";
import { shapeWords } from "./shapes";
import { sportWords } from "./sports";
import { vehicleWords } from "./vehicles";

export const wordListMap = {
    art: artWords,
    autumn: autumnWords,
    christmas: christmasWords,
    clothing: clothingWords,
    desserts: dessertWords,
    devices: deviceWords,
    dogs: dogWords,
    farm: farmWords,
    flowers: flowerWords,
    food: cookingWords,
    furniture: furnitureWords,
    geography: geographyWords,
    insects: insectWords,
    instruments: instrumentWords,
    ocean: oceanWords,
    pirates: pirateWords,
    plants: plantWords,
    reptiles: reptileWords,
    shapes: shapeWords,
    sports: sportWords,
    vehicles: vehicleWords,
} as const

export type WordListName = keyof typeof wordListMap;
export type WordList = (typeof wordListMap)[WordListName];