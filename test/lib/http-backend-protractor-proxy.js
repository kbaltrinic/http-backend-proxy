/**
 * http-backend-protractor-proxy - https://github.com/kbaltrinic/http-backend-protractor-proxy
 * (c) 2014 Kenneth Baltrinic. http://www.baltrinic.com
 * License: MIT
 */
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
