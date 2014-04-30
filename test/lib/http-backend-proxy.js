/**
 * http-backend-proxy - https://github.com/kbaltrinic/http-backend-proxy
 * (c) 2014 Kenneth Baltrinic. http://www.baltrinic.com
 * License: MIT
 */
'use strict';

module.exports = function(browser, options){

  var DEFAULT_CONTEXT_FIELD_NAME = 'context';

  options || (options = {});
  options.buffer || (options.buffer = false);

  //This is for backward compatibility since we changed the API from 1.1.1 to 1.2
  if(options.contextField === false){
    console.warn("Setting contextField: false is deprected.  Set contextAutoSync: false instead.");
    options.contextAutoSync = false;
  }

  options.contextAutoSync = typeof(options.contextAutoSync) === 'undefined' || !!options.contextAutoSync;
  options.contextField || (options.contextField = DEFAULT_CONTEXT_FIELD_NAME);

  var proxy = this;
  var buffer = [];

  if(options.contextAutoSync){
    this[options.contextField] = {};
  }

  createMethods(this, 'when', buildWhenFunction);

  function createMethods(proxy, prefix, functionBuilder) {
    ['', 'GET', 'PUT', 'HEAD', 'POST', 'DELETE', 'PATCH', 'JSONP'].forEach(function(method) {
     proxy[prefix + method] = functionBuilder(prefix + method);
    });
  }

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

  function executeOrBuffer(script){
    if(options.buffer){
      buffer.push(script);
    } else {
      script = getContextDefinitionScript() + script;
      return browser.executeScript(script);
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

  this.syncContext = function(context){

    if(typeof(context) !== 'undefined'){

      proxy[options.contextField] = context;

    } else {

      if(typeof(proxy[options.contextField]) === 'undefined'){
        proxy[options.contextField] = {};
      }

      context =  proxy[options.contextField];
    }

    return browser.executeScript(getContextDefinitionScript(context));
  }

  function stringifyArgs(args){
    var i, s = [];
    for(i = 0; i < args.length; i++){
      s.push(stringifyObject(args[i]));
    }
    return s.join(', ');
  }

  function getContextDefinitionScript(context){

    if(options.contextAutoSync){
      context = context || proxy[options.contextField];
    }

    if(typeof(context) !== 'undefined'){
      return 'window.$httpBackend.' + options.contextField + '=' + stringifyObject(context) + ';';
    } else {
      return '';
    }
  }

  function stringifyObject(obj){

    if(obj === null)
      return 'null';

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

};
