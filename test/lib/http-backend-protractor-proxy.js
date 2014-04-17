'use strict';

module.exports = function(browser){

  function stringifyArgs(args){
    var i, s = [];
    for(i = 0; i < args.length; i++){
      s.push(JSON.stringify(args[i]));
    }
    return s.join(', ');
  }

  this.when = function(){

    var whenJS = 'window.$httpBackend.when(' + stringifyArgs(arguments) + ')';

    return {
      respond: function() {

        var fullJS = whenJS +'.respond(' + stringifyArgs(arguments) + ');'

        return browser.executeScript(fullJS);
      },
      passThrough: function() {
        return browser.executeScript(whenJS +'.passThrough(' + stringifyArgs(arguments) + ');');
      }
    };

  };

};
