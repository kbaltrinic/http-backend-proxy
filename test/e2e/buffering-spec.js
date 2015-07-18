'use strict';

/*
 *  These Specs provide a basic test of the buffering works as expected.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('Buffered configuration', function(){

  var proxy, returnValue1, returnValue2;

  var firstRun = true;

  beforeEach(function () {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');
          element(by.id('method')).sendKeys('GET');

      proxy = new HttpBackend(browser, {buffer: true});

      returnValue1 = proxy.whenGET('/url1').respond(200);
      returnValue2 = proxy.whenGET('/url2').respond(200);
      }

  });

  it('should not return a promise for the first call', function(){
    expect(returnValue1).toBeUndefined();
  });

  it('should not return a promise for the second call', function(){
    expect(returnValue2).toBeUndefined();
  });

  describe('before flushing the buffer', function () {

    it('/url1 should not work', function () {

          element(by.id('url')).clear()
          element(by.id('url')).sendKeys('url1');
          element(by.id('call')).click();

          expect(element(by.id('r-status')).getText()).toEqual('');
    });

    it('/url2 should not work', function () {

          element(by.id('url')).clear()
          element(by.id('url')).sendKeys('url2');
          element(by.id('call')).click();

          expect(element(by.id('r-status')).getText()).toEqual('');
    });
  });

  describe('after flushing the buffer', function () {

    var returnValue1;
    var firstTime2 = true;

    beforeEach(function () {

      if(firstTime2){
        firstTime2 = false;

        returnValue1 = proxy.flush();
      }

    });

    it('flush() should return a promise.', function () {
      expect(returnValue1 instanceof protractor.promise.Promise).toEqual(true);
    });

    it('/url1 should work', function () {

          element(by.id('url')).clear()
          element(by.id('url')).sendKeys('url1');
          element(by.id('call')).click();

          expect(element(by.id('r-status')).getText()).toEqual('200');
    });

    it('/url2 should work', function () {

          element(by.id('url')).clear()
          element(by.id('url')).sendKeys('url2');
          element(by.id('call')).click();

          expect(element(by.id('r-status')).getText()).toEqual('200');
    });

    it('flushing again should not error.', function () {
      expect(function(){ proxy.flush(); }).not.toThrow();
    });

  });

});
