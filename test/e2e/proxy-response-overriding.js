'use strict';

var HttpBackend = require('../lib/http-backend-proxy');

describe('Overriding responses', function(){

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

        httpBackend.when('GET', '/remote').respond(200, {
          msg: "A different response from /remote",
        }, {'test-header': 'remote success again'});

        element(by.id('call')).click();
      }

    });

    it('should result in a response status of 200', function() {

      expect(element(by.id('r-status')).getText()).toEqual('200');

    });

    it('should display altered response body', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('{"msg":"A different response from /remote"}');

    });

    it('should display altered response header', function() {

      expect(element(by.id('r-headers')).getText())
        .toEqual('{"test-header":"remote success again"}');

    });

  });
});
