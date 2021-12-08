interface ILS {
    unlockedLevels: { [key: string]: boolean };
    completedLevels: { [key: string]: boolean };
}

const everyLevel = {
    "Food I": true,
    "Vehicles I": true,
    "Ocean I": true,
    "Ocean II": true,
    "Vehicles II": true,
    "Dogs I": true,
    "Geography I": true,
    "Clothing I": true,
    "Plants I": true,
    "Furniture I": true,
    "Ocean III": true,
    "Autumn I": true,
    "Reptiles I": true,
    "Flowers I": true,
    "Insects I": true,
    "Instruments I": true,
    "Devices I": true,
    "Clothing II": true,
    "Sports I": true,
    "Devices II": true,
    "Plants II": true,
    "Instruments II": true,
    "Christmas I": true,
    "Shapes I": true,
    "Flowers II": true,
    "Instruments III": true,
    "Shapes II": true,
    "Furniture II": true,
    "Art I": true,
    "Reptiles II": true,
    "Plants III": true,
    "Shapes III": true,
    "Farm I": true,
    "Autumn II": true,
    "Art II": true,
    "Vehicles III": true,
    "Desserts I": true,
    "Reptiles III": true,
    "Food II": true,
    "Clothing III": true,
    "Sports II": true,
    "Farm II": true,
    "Dogs II": true,
    "Desserts II": true,
    "Geography II": true,
    "Reptiles IV": true,
    "Autumn III": true,
    "Furniture III": true,
    "Furniture IV": true,
    "Flowers III": true,
    "Ocean IV": true,
    "Farm III": true,
    "Furniture V": true,
    "Insects II": true,
    "Food III": true,
    "Vehicles IV": true,
    "Insects III": true,
    "Geography III": true,
    "Pirates I": true,
    "Art III": true,
    "Autumn IV": true,
    "Furniture VI": true,
    "Autumn V": true,
    "Insects IV": true,
    "Christmas II": true,
    "Reptiles V": true,
    "Vehicles V": true,
    "Autumn VI": true,
    "Pirates II": true,
    "Shapes IV": true,
    "Reptiles VI": true,
    "Clothing IV": true,
    "Ocean V": true,
    "Autumn VII": true,
    "Autumn VIII": true,
    "Geography IV": true,
    "Insects V": true,
    "Furniture VII": true,
    "Insects VI": true,
    "Instruments IV": true,
    "Desserts III": true,
    "Farm IV": true,
    "Reptiles VII": true,
    "Reptiles VIII": true,
    "Geography V": true,
    "Farm V": true,
    "Dogs III": true,
    "Vehicles VI": true,
    "Vehicles VII": true,
    "Pirates III": true,
    "Ocean VI": true,
    "Farm VI": true,
    "Instruments V": true,
    "Sports III": true,
    "Christmas III": true,
    "Insects VII": true,
    "Dogs IV": true,
    "Ocean VII": true,
    "Desserts IV": true,
    "Reptiles IX": true,
    "Plants IV": true,
    "Instruments VI": true,
    "Shapes V": true,
    "Flowers IV": true,
    "Flowers V": true,
    "Pirates IV": true,
    "Food IV": true,
    "Furniture VIII": true,
    "Ocean VIII": true,
    "Reptiles X": true,
    "Geography VI": true,
    "Food V": true,
    "Reptiles XI": true,
    "Pirates V": true,
    "Ocean IX": true,
    "Clothing V": true,
    "Plants V": true,
    "Flowers VI": true,
    "Clothing VI": true,
    "Autumn IX": true,
    "Food VI": true,
    "Plants VI": true,
    "Art IV": true,
    "Autumn X": true,
    "Devices III": true,
    "Sports IV": true,
    "Insects VIII": true,
    "Pirates VI": true,
    "Farm VII": true,
    "Insects IX": true,
    "Flowers VII": true,
    "Autumn XI": true,
    "Insects X": true,
    "Geography VII": true,
    "Pirates VII": true,
    "Furniture IX": true,
    "Insects XI": true,
    "Plants VII": true,
    "Christmas IV": true,
    "Devices IV": true,
    "Insects XII": true,
    "Insects XIII": true,
    "Ocean X": true,
    "Instruments VII": true,
    "Autumn XII": true,
    "Sports V": true,
    "Instruments VIII": true,
    "Autumn XIII": true,
    "Instruments IX": true,
    "Desserts V": true,
    "Insects XIV": true,
    "Pirates VIII": true,
    "Christmas V": true,
    "Autumn XIV": true,
    "Shapes VI": true,
    "Instruments X": true,
    "Plants VIII": true,
    "Insects XV": true,
    "Food VII": true,
    "Insects XVI": true,
    "Shapes VII": true,
    "Instruments XI": true,
    "Pirates IX": true,
    "Instruments XII": true,
    "Devices V": true,
    "Devices VI": true,
    "Christmas VI": true,
    "Flowers VIII": true,
    "Clothing VII": true,
    "Instruments XIII": true,
    "Plants IX": true,
    "Art V": true,
    "Food VIII": true
}

const everyLS: ILS = {
    unlockedLevels: everyLevel,
    completedLevels: everyLevel,
}

export const defaultLS: ILS = {
    unlockedLevels: {
        "Food I": true
    },
    completedLevels: {

    }
};

const disableLS = false;
const doEveryLS = false;

const ls = doEveryLS ? JSON.stringify(everyLS) : (!disableLS && localStorage.getItem("LS_wordfind")) || JSON.stringify(defaultLS);

const LS: ILS = JSON.parse(ls);

export const getLS = (key: keyof ILS) => LS[key];
export const setLS = (key: keyof ILS, value: ILS[keyof ILS]) => {
    LS[key] = value;
    localStorage.setItem("LS_wordfind", JSON.stringify(LS));
}