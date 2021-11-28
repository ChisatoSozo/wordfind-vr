const stateObject = {
    listOfStates: [
        {
            name: 'Alabama',
        },
        {
            name: 'Alaska',
        },
        {
            name: 'Arizona',
        },
    ]
}

let myState = stateObject.listOfStates;

const myObject = [...myState][0];
myObject.name = 'New Name';
myState[0] = myObject;

console.log(stateObject.listOfStates[0].name);