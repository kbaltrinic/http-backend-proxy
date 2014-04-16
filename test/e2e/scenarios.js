'use strict';

describe('Default ngMockE2E Behavior', function() {

  describe('Basic GET call', function() {

    beforeEach(function() {

      browser.get('index.html');

      element(by.id('method')).sendKeys('GET');
      element(by.id('url')).sendKeys('test');
      element(by.id('call')).click();

    });

    it('should result in a response status of 200', function() {

      expect(element(by.id('r-status')).getText()).toEqual('200');

    });

    it('should result in the mocked response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('{"msg":"You called /test","args":null}');

    });

    it('should result in the mocked response headers being displayed', function() {

      expect(element(by.id('r-headers')).getText())
        .toEqual('{"test-header":"success"}');

    });

  });

  describe('Basic GET call returning an error', function() {

    beforeEach(function() {

      browser.get('index.html');

      element(by.id('method')).sendKeys('GET');
      element(by.id('url')).sendKeys('missing');
      element(by.id('call')).click();

    });

    it('should result in a response status of 404', function() {

      expect(element(by.id('r-status')).getText()).toEqual('404');

    });

    it('should result in the mocked response body being displayed', function() {

      expect(element(by.id('r-data')).getText())
        .toEqual('"You called /missing"');

    });

    it('should result in the mocked response headers being displayed', function() {

      expect(element(by.id('r-headers')).getText())
        .toEqual('{"test-header":"failed"}');

    });

  });

});
