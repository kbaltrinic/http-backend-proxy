'use strict';

/*
 *  These Specs provide a basic test of the buffering works as expected.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('onLoad', function(){

  var proxy;

  var firstRun = true;

  beforeEach(function () {

    if(firstRun){
      firstRun = false;

      proxy = new HttpBackend(browser, {buffer: true});

      proxy.context = {
        statusCode: 205,
        statusText: "chocolate"
      };

      proxy.onLoad.whenGET('user-prefs').respond(function(){
        return [$httpBackend.context.statusCode, $httpBackend.context.statusText];
      });

      browser.get('index.html?{"method":"GET","url":"user-prefs"}');
    }

  });

  it('should configure the browser early enough to respond to http requests name in module.run() scripts.', function(){
      expect(element(by.id('r-status')).getText()).toEqual('205');
      expect(element(by.id('r-data')).getText()).toEqual('"chocolate"');
  });

  describe('if reset', function(){

    beforeEach(function () {
      proxy.onLoad.reset();
      browser.get('index.html?{"method":"GET","url":"user-prefs"}');
    });

    it('should no longer configure the browser to respond to http requests.', function(){
        expect(element(by.id('r-status')).getText()).toEqual('5000');
    });
  });

  afterEach(function () {
    //Always call reset when ever an onload.when... has been invoked.
    proxy.onLoad.reset();
  });

});