/**
 * http-backend-proxy - https://github.com/kbaltrinic/http-backend-proxy
 * (c) 2014 Kenneth Baltrinic. http://www.baltrinic.com
 * License: MIT
 */
'use strict';

module.exports = function(browser, options){

  options || (options = {});
  options.buffer || (options.buffer = false);
  typeof(options.contextField) !== 'undefined' || (options.contextField = 'context');

  var proxy = this;
  var buffer = [];

  this.context = {};

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

  function executeOrBuffer(script){
    if(options.buffer){
      buffer.push(script);
    } else {
      script = getContextDefinitionScript() + script;
      return browser.executeScript(script);
    }
  }

  function getContextDefinitionScript(){

    function stringifyObject(obj){

      if(typeof obj === 'function' || obj instanceof RegExp )
        return obj.toString();

      if(typeof(obj) === 'object' && !(obj instanceof Array)){

        var fields = [];
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            fields.push('"'+ key + '":' + stringifyObject(obj[key]));
          }
        }

        return '{' + fields.join(',') + '}';
      }

      return JSON.stringify(obj);

    }

    if(typeof(options.contextField) == 'string'){
      return 'window.$httpBackend.' + options.contextField + '=' + stringifyObject(proxy.context) + ';';
    } else {
      return '';
    }
  }

  this.flush = function(){
    if(buffer.length > 0){
      var script = getContextDefinitionScript() + buffer.join('\n');
      buffer = [];
      return browser.executeScript(script);
    } else {
      var deferred = protractor.promise.defer();
      deferred.promise.complete();
      return deferred.promise;
    }
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

          return executeOrBuffer(fullJS);
        },
        passThrough: function() {
          return executeOrBuffer(whenJS +'.passThrough(' + stringifyArgs(arguments) + ');');
        }
      };

    };

  };

};
