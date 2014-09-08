'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var regexScenarios = require('./helpers/regular-expression-scenarios')

describe('Proxy.when JavaScript generation', function(){

  var browser;
  var proxy;

  beforeEach(function () {

    browser = { executeScript: function(){} };
    spyOn(browser, 'executeScript');

    proxy = new HttpBackend(browser, {contextAutoSync: false});

  });

  it('should generate correct JavaScript for parameterless calls to respond()', function () {

    proxy.when().respond();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when().respond();');

  });

  it('should generate correct JavaScript for parameterless calls to passThrough()', function () {

    proxy.when().passThrough();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when().passThrough();');

  });

  it('should generate correct JavaScript for calls with one when() and one respond() argument', function () {

    proxy.when('GET').respond(200);
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET").respond(200);');

  });

  it('should generate correct JavaScript for calls with one when() argument to passThrough()', function () {

    proxy.when('GET').passThrough();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET").passThrough();');

  });

  it('should generate correct JavaScript for calls with two when() and two respond() arguments', function () {

    proxy.when('GET', '/endpoint').respond(200, {json: 'response'});
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint").respond(200, {"json":"response"});');

  });

  it('should generate correct JavaScript for calls with two when() arguments to passThrough()', function () {

    proxy.when('GET', '/endpoint').passThrough();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint").passThrough();');

  });

  it('should generate correct JavaScript for calls with three when() and three respond() arguments', function () {

    proxy.when('GET', '/endpoint', {json: 'request'}).respond(200, {json: 'response'}, {header: 'value'});
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint", {"json":"request"}).respond(200, {"json":"response"}, {"header":"value"});');

  });

  it('should generate correct JavaScript for calls with three when() arguments to passThrough()', function () {

    proxy.when('GET', '/endpoint', {json: 'request'}).passThrough();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint", {"json":"request"}).passThrough();');

  });

  it('should generate correct JavaScript for calls with four when() and four respond() arguments', function () {

    proxy.when('GET', '/endpoint', {json: 'request'}, {header2: "value2"}).respond(200, {json: 'response'}, {header: 'value'}, "OK");
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint", {"json":"request"}, {"header2":"value2"}).respond(200, {"json":"response"}, {"header":"value"}, "OK");');

  });

  it('should generate correct JavaScript for calls with four when() arguments to passThrough()', function () {

    proxy.when('GET', '/endpoint', {json: 'request'}, {header2: "value2"}).passThrough();
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint", {"json":"request"}, {"header2":"value2"}).passThrough();');

  });


  it('should generate correct JavaScript for calls with complex json arguments', function () {

    //Admittedly in the below, passing a function doesn't make a lot of sense but out aim
    //is simply to replicate the local call on the remote browser.  It would require special
    //handling to NOT serialize functions so well keep it simple.
    var json = {
      string: "abc",
      number: 290,
      obj: {
        nested: "object"
      },
      array: [ 232, "ABC", null, {} ],
      null: null,
      regex: /find me/,
      func: function(){ return null; }
    };

    var stringified = '{"string":"abc","number":290,"obj":{"nested":"object"},"array":[232,"ABC",null,{}],"null":null,"regex":new RegExp("find me"),"func":function (){ return null; }}';

    proxy.when('GET', '/endpoint', json).respond(200, json);
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", "/endpoint", ' + stringified + ').respond(200, ' + stringified + ');');

  });

  it('should generate correct JavaScript for calls with anonymous functions', function () {

    proxy.when('GET', function(url){return url.indexOf('/home') == 0;}).respond(function(method, url, data, headers){ return [200, 'you callded ' + url];});
    expect(browser.executeScript.calls[0].args[0]).toContain(
      '$httpBackend.when("GET", function (url){return url.indexOf(\'/home\') == 0;}).respond(function (method, url, data, headers){ return [200, \'you callded \' + url];});');

  });


  for(var i = 0; i < regexScenarios.length; i++){ (function(scenario){
    it('should generate correct JavaScript for calls with regular expression '  + scenario.desc,
    function () {

      proxy.when('GET', scenario.regex ).passThrough();
      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.when("GET", ' + scenario.output + ').passThrough();');

    });
  })(regexScenarios[i])}

});