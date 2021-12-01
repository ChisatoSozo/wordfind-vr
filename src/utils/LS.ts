interface ILS {
    unlockedLevels: { [key: string]: boolean };
}

export const defaultLS: ILS = {
    unlockedLevels: {
        "Food I": true
    }
};

const disableLS = false;

const ls = (!disableLS && localStorage.getItem("LS_wordfind")) || JSON.stringify(defaultLS);
console.log(ls)
const LS: ILS = JSON.parse(ls);

export const getLS = (key: keyof ILS) => LS[key];
export const setLS = (key: keyof ILS, value: ILS[keyof ILS]) => {
    LS[key] = value;
    localStorage.setItem("LS_wordfind", JSON.stringify(LS));
}