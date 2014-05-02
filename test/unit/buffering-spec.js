'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var Browser = require('./helpers/protractor-browser')

describe('Buffered configuration', function(){

  var browser;

  beforeEach(function () {

    browser = new Browser();

  });

  afterEach(function () {
    browser.cleanUp();
  });

  describe('A proxy with buffering not configured', function () {

    var proxy, returnValue1, returnValue2;

    beforeEach(function () {

      proxy = new HttpBackend(browser);

      returnValue1 = proxy.whenGET('/url1').passThrough();
      returnValue2 = proxy.whenGET('/url2').passThrough();

    });

    it('should make two executeScript calls', function () {
      expect(browser.executeScript.calls.length).toEqual(2);
    });

    it('should call executeScript first for the first call to the proxy', function () {
      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.whenGET("/url1").passThrough();');
    });

    it('should call executeScript again for the second call to the proxy', function () {
      expect(browser.executeScript.calls[1].args[0]).toContain(
        '$httpBackend.whenGET("/url2").passThrough();');
    });

    it('should pass the data context on each call to the proxy', function () {
      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={};');
      expect(browser.executeScript.calls[1].args[0]).toContain(
        '$httpBackend.context={};');
    });

    it('should return a pending promise for the first call', function(){
      expect(returnValue1.isComplete).toEqual(false);
    });

    it('should return a pending promise for the second call', function(){
      expect(returnValue2.isComplete).toEqual(false);
    });

  });

  describe('A proxy with buffering turned off', function () {

    var proxy, returnValue1, returnValue2;

    beforeEach(function () {

      proxy = new HttpBackend(browser, {buffer: false});

      returnValue1 = proxy.whenGET('/url1').passThrough();
      returnValue2 = proxy.whenGET('/url2').passThrough();

    });

    it('should make two executeScript calls', function () {
      expect(browser.executeScript.calls.length).toEqual(2);
    });

    it('should call executeScript first for the first call to the proxy', function () {
      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.whenGET("/url1").passThrough();');
    });

    it('should call executeScript again for the second call to the proxy', function () {
      expect(browser.executeScript.calls[1].args[0]).toContain(
        '$httpBackend.whenGET("/url2").passThrough();');
    });

    it('should pass the data context on each call to the proxy', function () {
      expect(browser.executeScript.calls[0].args[0]).toContain(
        '$httpBackend.context={};');
      expect(browser.executeScript.calls[1].args[0]).toContain(
        '$httpBackend.context={};');
    });

    it('should return a pending promise for the first call', function(){
      expect(returnValue1.isComplete).toEqual(false);
    });

    it('should return a pending promise for the second call', function(){
      expect(returnValue2.isComplete).toEqual(false);
    });

  });

  describe('A proxy with buffering turned on', function () {

    var proxy, returnValue1, returnValue2;

    beforeEach(function () {

      proxy = new HttpBackend(browser, {buffer: true});

      proxy.context.value="before";

      returnValue1 = proxy.whenGET('/url1').passThrough();
      returnValue2 = proxy.whenGET('/url2').passThrough();

      proxy.context.value="current";

    });

    it('should not return a promise for the first call', function(){
      expect(returnValue1).toBeUndefined();
    });

    it('should not return a promise for the second call', function(){
      expect(returnValue2).toBeUndefined();
    });

    describe('before flushing the buffer', function () {

      it('shoud make no executeScript calls', function () {
        expect(browser.executeScript.calls.length).toEqual(0);
      });

    });

    describe('after flushing the buffer', function () {

      var returnValue1;

      beforeEach(function () {
        returnValue1 = proxy.flush();
      });

      it('flush should return a pending promise.', function () {
        expect(returnValue1.isComplete).toEqual(false);
      });

      it('should make one executeScript call', function () {
        expect(browser.executeScript.calls.length).toEqual(1);
      });

      it('should include all calls to the proxy in that single call', function () {
        expect(browser.executeScript.calls[0].args[0]).toContain(
          '$httpBackend.whenGET("/url1").passThrough();\n$httpBackend.whenGET("/url2").passThrough();');
      });

      it('should pass the current data context to the browser', function () {
        expect(browser.executeScript.calls[0].args[0]).toContain(
          '$httpBackend.context={"value":"current"};');
      });

      describe('additional calls to flush', function () {

        var returnValue2;

        beforeEach(function () {
          returnValue2 = proxy.flush()
        });

        it('should not call executeScript a second time', function () {
          proxy.flush();
          expect(browser.executeScript.calls.length).toEqual(1);
        });

        it('should return a completed promise.', function () {
          expect(returnValue2.isComplete).toEqual(true);
        });

      });

    });

  });

});