'use strict';

/*
 *  These Specs provide a basic test of the buffering works as expected.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('Context', function(){

  var $httpBackend;
    var firstRun = true;

    beforeEach(function() {

      if(firstRun){
        firstRun = false;

        browser.get('index.html');

        $httpBackend = new HttpBackend(browser);

        $httpBackend.context = {
          statusCode: 205,
          statusText: "Sort-of OK ;-)",
        getResponse: function(url){return [200, 'You called: ' + url]}
        }

        $httpBackend.when('GET', '/remote')
          .respond(function(method, url){return [
            $httpBackend.context.statusCode,
            $httpBackend.context.statusText
          ];});

        $httpBackend.when('GET', '/func')
          .respond(function(method, url){return $httpBackend.context.getResponse(url);});

        element(by.id('method')).sendKeys('GET');

      }

    });

    it('should be available on the server', function() {

      element(by.id('url')).clear();
      element(by.id('url')).sendKeys('remote');
      element(by.id('call')).click();

      expect(element(by.id('r-status')).getText()).toEqual('205');
      expect(element(by.id('r-data')).getText()).toEqual('"Sort-of OK ;-)"');

    });


    it('functions should be callable on the server', function() {


      element(by.id('url')).clear();
      element(by.id('url')).sendKeys('func');
      element(by.id('call')).click();

      expect(element(by.id('r-status')).getText()).toEqual('200');
      expect(element(by.id('r-data')).getText()).toEqual('"You called: /func"');

    });

    it('syncronization via syncContext should update the server context', function() {

      $httpBackend.syncContext({statusText: 'Event Better!'});

      element(by.id('url')).clear();
      element(by.id('url')).sendKeys('remote');
      element(by.id('call')).click();

      expect(element(by.id('r-status')).getText()).toEqual('205');
      expect(element(by.id('r-data')).getText()).toEqual('"Event Better!"');

    });

});