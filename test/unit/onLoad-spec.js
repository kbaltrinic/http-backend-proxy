'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var Browser = require('./helpers/protractor-browser')

describe('onLoad configuration', function(){

    var browser;

    beforeEach(function () {

        browser = {
            get: function(){},
            addMockModule: function(){}
        };

        spyOn(browser, 'get');
        spyOn(browser, 'addMockModule');

    });

    describe('A proxy where no onLoad calls were made', function () {

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
            var onLoad = proxy.onLoad;
            browser.get('index.html');
        });

        it('should make no addMockModule calls', function () {
            expect(browser.addMockModule).not.toHaveBeenCalled();
        });

        it('should call get once.', function () {
            expect(browser.get.calls.length).toEqual(1);
        });

        it('should call get with the passed url.', function () {
            expect(browser.get.calls[0].args[0]).toEqual('index.html');
        });

    });

});