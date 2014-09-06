module.exports = [
    {
        regex : /find me/,
        output: "new RegExp('find me')",
        desc  : 'litterals'
    }, {
        regex : /find me/ig,
        output: "new RegExp('find me','gi')",
        desc  : 'litterals with modifiers'
    }, {
        regex : new RegExp('find me'),
        output: "new RegExp('find me')",
        desc  : 'constructors'
    }, {
        regex : new RegExp('find me', 'ig'),
        output: "new RegExp('find me','gi')",
        desc  : 'constructors with modifiers'
    }
];