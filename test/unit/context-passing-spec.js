'use strict';

var HttpBackend = require('../lib/http-backend-proxy');

describe('The Context Object', function(){

  var browser;
    var proxy;

  beforeEach(function () {

    browser = { executeScript: function(){} };
    spyOn(browser, 'executeScript');

  });

  describe('when auto-syncronization is disabled', function(){

    beforeEach(function () {

      proxy = new HttpBackend(browser, {contextAutoSync: false});

    });

    it('should still initialize the context object', function(){

      expect(proxy.context).toEqual({});

    });

    it('should not forward any context to the browser even if it exists', function(){

      proxy.context = 'I exist!';
      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).not.toContain(
        '$httpBackend.context=');

    });

  });

  describe('when auto-syncronization is disabled the deprecated way', function(){

    beforeEach(function () {

      spyOn(console, 'warn');
      proxy = new HttpBackend(browser, {contextField: false});

    });

    it('should warn the developer', function(){

      expect(console.warn).toHaveBeenCalled();

    });

    it('should still initialize the context object', function(){

      expect(proxy.context).toEqual({});

    });

    it('should still not forward any context to the browser even if it exists', function(){

      proxy.context = 'I exist!';
      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).not.toContain(
        '$httpBackend.context=');

    });

  });

  describe('when configured with an alternate field name', function(){

    beforeEach(function () {

      proxy = new HttpBackend(browser, {contextField: 'alternate'});

    });

    it('should initialize the alternate object', function(){

      expect(proxy.alternate).toEqual({});

    });

    it('should forward the context to the browser under the alternate name', function(){

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.alternate={};$httpBackend.whenGET("/someURL").respond(200);');

    });

  });

  describe('in its default configuration', function(){

    beforeEach(function () {

      proxy = new HttpBackend(browser);

    });

    it('should initialize to an empty object', function(){

      expect(proxy.context).toEqual({});

    });

    it('should forwarded to the browser even if empty', function(){

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded all basic data types', function(){

      proxy.context.string  = 'A string';
      proxy.context.number  = 1;
      proxy.context.boolean = true;

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"string":"A string","number":1,"boolean":true};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded arrays', function(){

      proxy.context.array = [1,2,3];

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"array":[1,2,3]};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded objects', function(){

      proxy.context.obj = {an: 'object'};

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"obj":{"an":"object"}};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded regular expressions', function(){

      proxy.context.regex = /find me/ig

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"regex":/find me/gi};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded functions expressions', function(){

      proxy.context.func = function(n){return n++;};

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"func":function (n){return n++;}};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded regular expressions when nested in objects', function(){

      proxy.context.obj = {regex:/find me/ig};

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"obj":{"regex":/find me/gi}};$httpBackend.whenGET("/someURL").respond(200);');

    });

    it('should forwarded functions expressions when nested in objects', function(){

      proxy.context.obj = {func: function(n){return n++;}};

      proxy.whenGET('/someURL').respond(200);

      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={"obj":{"func":function (n){return n++;}}};$httpBackend.whenGET("/someURL").respond(200);');

    });

  });

});