'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var Browser = require('./helpers/protractor-browser')

describe('onLoad configuration', function(){

    var browser, browser_get;

    beforeEach(function () {

        browser = {
            get: function(){},
            addMockModule: function(){},
            executeScript: function(){}
        };

        spyOn(browser, 'get');
        spyOn(browser, 'addMockModule');
        spyOn(browser, 'executeScript');

        //Needed because onLoad will replace browser.get this its own implementation.
        //But we need to test that the original still gets called in the end.
        browser_get = browser.get;
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
            expect(browser_get.calls.length).toEqual(1);
        });

        it('should call get with the passed url.', function () {
            expect(browser_get.calls[0].args[0]).toEqual('index.html');
        });

    });

    describe('A proxy where onLoad calls were made', function () {

        var proxy, returnValue1, returnValue2;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
            proxy.onLoad.whenGET('/session-info').passThrough();
            proxy.onLoad.whenGET('/preferences').passThrough();
            browser.get('index.html');
        });

        it('should call addMockModule once', function () {
            expect(browser.addMockModule.calls.length).toEqual(1);
        });

        it('should call addMockModule with a script that adds a module that uses ngMockE2E', function () {
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                'angular.module("http-backend-proxy", ["ngMockE2E"]).run(function($httpBackend){');
        });

        it('should call addMockModule with a script that contains all the calls made to onLoad', function () {
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                '$httpBackend.whenGET("/session-info").passThrough();');
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                '$httpBackend.whenGET("/preferences").passThrough();');
        });

        it('should call get once.', function () {
            expect(browser_get.calls.length).toEqual(1);
        });

        it('should call get with the passed url.', function () {
            expect(browser_get.calls[0].args[0]).toEqual('index.html');
        });

        it('should not call executeScript.', function () {
            expect(browser.executeScript).not.toHaveBeenCalled();
        });
    });

});