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

const noUndefined = (words: any): string[] => words.filter((w: string[]) => w !== undefined);

export const wordListMap = {
    art: noUndefined(artWords),
    autumn: noUndefined(autumnWords),
    christmas: noUndefined(christmasWords),
    clothing: noUndefined(clothingWords),
    desserts: noUndefined(dessertWords),
    devices: noUndefined(deviceWords),
    dogs: noUndefined(dogWords),
    farm: noUndefined(farmWords),
    flowers: noUndefined(flowerWords),
    food: noUndefined(cookingWords),
    furniture: noUndefined(furnitureWords),
    geography: noUndefined(geographyWords),
    insects: noUndefined(insectWords),
    instruments: noUndefined(instrumentWords),
    ocean: noUndefined(oceanWords),
    pirates: noUndefined(pirateWords),
    plants: noUndefined(plantWords),
    reptiles: noUndefined(reptileWords),
    shapes: noUndefined(shapeWords),
    sports: noUndefined(sportWords),
    vehicles: noUndefined(vehicleWords),
} as const

export type WordListName = keyof typeof wordListMap;
export type WordList = string[];