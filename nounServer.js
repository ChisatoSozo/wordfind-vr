var fs = require('fs'), request = require('request');

const KEY = '4216377ee6dc443787d8c8135aa1895c';
const SECRET = 'c5034cfe991f4ee78b8780bef0c04d34';

const wordCategory = "plants";
const words = [
    "acorn",
    "alfalfa",
    "bamboo",
    "bark",
    "bean",
    "berry",
    "blade",
    "brush",
    "bud",
    "bulb",
    "bush",
    "cactus",
    "clover",
    "cork",
    "corolla",
    "fern",
    "flora",
    "flower",
    "forest",
    "fruit",
    "garden",
    "grain",
    "grass",
    "grove",
    "herb",
    "ivy",
    "jungle",
    "juniper",
    "kelp",
    "kudzu",
    "leaf",
    "lily",
    "moss",
    "nectar",
    "palm",
    "petal",
    "pollen",
    "resin",
    "root",
    "sage",
    "sap",
    "seed",
    "shoot",
    "shrub",
    "spore",
    "stalk",
    "spine",
    "sprout",
    "stem",
    "thorn",
    "tree",
    "trunk",
    "twig",
    "vein",
    "vine",
    "weed",
    "wood",
]

const NounProject = require('the-noun-project')
const nounProject = new NounProject({
    key: KEY,
    secret: SECRET
});

var download = function (uri, filename, callback) {
    request.head(uri, function (err, res, body) {

        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

const validWords = []

const promises = [];

fs.mkdirSync("./public/icons/" + wordCategory);

words.forEach((word) => {
    promises.push(new Promise(resolve => nounProject.getIconByTerm(word, function (err, data) {
        console.log(err)
        if (!err) {
            download(data.icon.preview_url, "./public/icons/" + wordCategory + "/" + word + ".png", () => { })
            validWords.push(word)
        }
        resolve()
    })));
})

Promise.all(promises).then(() => console.log(validWords));