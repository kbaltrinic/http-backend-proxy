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

      var stringified = ( typeof args[i] === 'function' || args[i] instanceof RegExp )
        ? args[i].toString()
        : JSON.stringify(args[i]);

      s.push(stringified);
    }
    return s.join(', ');
  }

  function createMethods(proxy, prefix, functionBuilder) {
    ['', 'GET', 'PUT', 'HEAD', 'POST', 'DELETE', 'PATCH', 'JSONP'].forEach(function(method) {
     proxy[prefix + method] = functionBuilder(prefix + method);
    });
  }

  createMethods(this, 'when', buildWhenFunction);

  function buildWhenFunction(funcName){

    return function(){

      var whenJS = 'window.$httpBackend.' + funcName + '(' + stringifyArgs(arguments) + ')';

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

};
