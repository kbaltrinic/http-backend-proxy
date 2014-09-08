module.exports = [
    {
        regex : /find me/,
        output: 'new RegExp("find me")',
        desc  : 'litterals'
    }, {
        regex : /find me/ig,
        output: 'new RegExp("find me","gi")',
        desc  : 'litterals with modifiers'
    }, {
        regex : new RegExp('find me'),
        output: 'new RegExp("find me")',
        desc  : 'constructors'
    }, {
        regex : new RegExp('find me', 'ig'),
        output: 'new RegExp("find me","gi")',
        desc  : 'constructors with modifiers'
    }, {
        regex : /\/a\/path/,
        output: 'new RegExp("\\\\/a\\\\/path")',
        desc  : 'litterals with forward slashes'
    }, {
        regex : new RegExp('/a/path'),
        output: 'new RegExp("/a/path")',
        desc  : 'constructors with forward slashes'
    }, {
        regex : /'quoted'/,
        output: 'new RegExp("\'quoted\'")',
        desc  : 'litterals with single quotes'
    }, {
        regex : new RegExp("'quoted'"),
        output: 'new RegExp("\'quoted\'")',
        desc  : 'constructors with single quotes'
    }, {
        regex : /"quoted"/,
        output: 'new RegExp("\\\"quoted\\\"")',
        desc  : 'litterals with double quotes'
    }, {
        regex : new RegExp('"quoted"'),
        output: 'new RegExp("\\\"quoted\\\"")',
        desc  : 'constructors with double quotes'
    }
];