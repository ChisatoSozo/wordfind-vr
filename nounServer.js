var fs = require('fs'), request = require('request');

const KEY = '4216377ee6dc443787d8c8135aa1895c';
const SECRET = 'c5034cfe991f4ee78b8780bef0c04d34';

const wordCategory = "Vehicles";
const words = [
   "airplane",
    "ambulance",
    "aircraft",
    "bicycle",
    "blimp",
    "buggy",
    "bus",
    "blimp",
    "boat",
    "boxcar",
    "barge",
    "biplane",
    "bobsled",
    "bulldozer",
    "cab",
    "caboose",
    "car",
    "chariot",
    "convoy",
    "caravan",
    "canoe",
    "dirtbike",
    "electriccar",
    "glider",
    "gondola",
    "helicopter",
    "hangglider",
    "hovercraft",
    "jet",
    "hearse",
    "humvee",
    "jeep",
    "jetski",
    "kayak",
    "lifeboat",
    "minibus",
    "motorcycle",
    "minivan",
    "plane",
    "rocket",
    "rover",
    "sailboat",
    "sedan",
    "segway",
    "ship",
    "steamboat",
    "sled",
    "snowmobile",
    "taxi",
    "tank",
    "tractor",
    "unicycle",
    "wagon",
    "yacht",
    "warship",
    




];


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