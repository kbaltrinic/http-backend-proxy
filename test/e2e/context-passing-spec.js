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
        	statusText: "Sort-of OK ;-)"
        }

        $httpBackend.when('GET', '/remote')
          .respond(function(method, url){return [
          	$httpBackend.context.statusCode,
          	$httpBackend.context.statusText
          ];});

        element(by.id('method')).sendKeys('GET');
        element(by.id('url')).sendKeys('remote');
        element(by.id('call')).click();

      }

    });

    it('should be available on the server', function() {

      expect(element(by.id('r-status')).getText()).toEqual('205');
      expect(element(by.id('r-data')).getText()).toEqual('"Sort-of OK ;-)"');

    });

});