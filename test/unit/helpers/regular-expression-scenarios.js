module.exports = [
    {
        regex : /find me/,
        output: '/find me/',
        desc  : 'litterals'
    }, {
        regex : /find me/ig,
        output: '/find me/gi',
        desc  : 'litterals with modifiers'
    }, {
        regex : new RegExp('find me'),
        output: '/find me/',
        desc  : 'constructors'
    }, {
        regex : new RegExp('find me', 'ig'),
        output: '/find me/gi',
        desc  : 'constructors with modifiers'
    }
];