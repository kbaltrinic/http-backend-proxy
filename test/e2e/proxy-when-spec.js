'use strict';

/*
 *  These Specs provide a basic test of tests to assert that the proxy can
 *  indeed configure $httpBackend from within protractor.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('Remote configuration behavior', function(){

  var angularVersion;
  var urlSelectorFunctionsSupported;
  var firstRun0 = true;

  beforeEach(function () {

    if(firstRun0){
      firstRun0 = false;

      browser.get('index.html');
      element(by.id('version')).getText().then(function(version){
        angularVersion = JSON.parse(version);
        urlSelectorFunctionsSupported = angularVersion.major > 1 || angularVersion.minor > 2;
      });
    }

  });

  describe('Basic remotely configured GET call', function() {

    var httpBackend;
    var firstRun = true;

    beforeEach(function() {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');

        httpBackend = new HttpBackend(browser);
        httpBackend.when('GET', '/remote').respond(200, {
          msg: "You called /remote",
        }, {'test-header': 'remote success'});

        element(by.id('method')).sendKeys('GET');
        element(by.id('url')).sendKeys('remote');
        element(by.id('call')).click();

      }

    });

    it('should result in a response status of 200', function() {

      expect(element(by.id('r-status')).getText()).toEqual('200');

    });

    it('should result in the mocked response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('{"msg":"You called /remote"}');

    });

    it('should result in the mocked response headers being displayed', function() {

      expect(element(by.id('r-headers')).getText())
        .toEqual('{"test-header":"remote success"}');

    });

  });


  describe('Remotely configured GET call returning an error', function() {

    var httpBackend;
    var firstRun = true;

    beforeEach(function() {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');

        httpBackend = new HttpBackend(browser);
        httpBackend.when('GET', '/not-there').respond(404, 'Not Found.');

        element(by.id('method')).sendKeys('GET');
        element(by.id('url')).sendKeys('not-there');
        element(by.id('call')).click();

      }

    });

    it('should result in a response status of 404', function() {

      expect(element(by.id('r-status')).getText()).toEqual('404');

    });

    it('should result in the mocked response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('"Not Found."');

    });

    it('should result in the mocked response headers being displayed', function() {

      expect(element(by.id('r-headers')).getText())
        .toEqual('{}');

    });

  });

  describe('Remotely configured GET call that uses functions', function() {

    var httpBackend;
    var firstRun = true;

    beforeEach(function() {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');

        httpBackend = new HttpBackend(browser);

        var urlSelector = urlSelectorFunctionsSupported
          ? function(url){return url.indexOf('/func') == 0;}
          : '/func-test';

        httpBackend.when('GET', urlSelector)
          .respond(function(method, url){return [200, 'You called: ' + url];});

        element(by.id('method')).sendKeys('GET');
        element(by.id('url')).sendKeys('func-test');
        element(by.id('call')).click();

      }

    });

    it('should result in a response status of 200', function() {

      expect(element(by.id('r-status')).getText()).toEqual('200');

    });

    it('should result in the computed response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('"You called: /func-test"');

    });

  });

  describe('Remotely configured GET call that uses a reqular expression', function() {

    var httpBackend;
    var firstRun = true;

    beforeEach(function() {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');

        httpBackend = new HttpBackend(browser);

        httpBackend.when('GET', /regexp/i)
          .respond(function(method, url){return [200, 'You called: ' + url];});

        element(by.id('method')).sendKeys('GET');
        element(by.id('url')).sendKeys('get-RegExp');
        element(by.id('call')).click();

      }

    });

    it('should result in a response status of 200', function() {

      expect(element(by.id('r-status')).getText()).toEqual('200');

    });

    it('should result in the computed response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('"You called: /get-RegExp"');

    });

  });

});
