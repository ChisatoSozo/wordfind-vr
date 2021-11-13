const KEY = '4216377ee6dc443787d8c8135aa1895c';
const SECRET = '9b9adf852ee5419e8c547891a13e617c';

const NounProject = require('the-noun-project')
const nounProject = new NounProject({
    key: KEY,
    secret: SECRET
});

nounProject.getIconsByTerm('goat', function (err, data) {
    console.log(err)
    if (!err) {
        console.log(data.icons);
    }
});
