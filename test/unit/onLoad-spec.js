'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var Browser = require('./helpers/protractor-browser')

var PROMISE = "PROMISE"

describe('onLoad configuration', function(){

    var browser, browser_get;

    beforeEach(function () {

        browser = {
            get: function(){ return PROMISE; },
            addMockModule: function(){},
            removeMockModule: function(){},
            executeScript: function(){}
        };

        spyOn(browser, 'get').andCallThrough();
        spyOn(browser, 'addMockModule');
        spyOn(browser, 'executeScript');

        //Needed because onLoad will replace browser.get this its own implementation.
        //But we need to test that the original still gets called in the end.
        browser_get = browser.get;
    });

    describe('The proxy object', function () {

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
        });

        it('should not support a reset() function', function () {
            expect(proxy.reset).toBeUndefined();
        });
    });

    describe('The onLoad object', function () {

        var onLoad;

        beforeEach(function () {

            var proxy = new HttpBackend(browser);
            onLoad = proxy.onLoad
        });

        it('should not have a flush() function', function () {
            expect(onLoad.flush).toBeUndefined();
        });

        it('should not have a syncContext() function', function () {
            expect(onLoad.syncContext).toBeUndefined();
        });

        it('should not have an onLoad object', function () {
            expect(onLoad.onLoad).toBeUndefined();
        });

        it('should not initialize a context object', function () {
            expect(onLoad.context).toBeUndefined();
        });
    });

    describe('A proxy where no onLoad calls were made', function () {

        var proxy, getResult;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
            var onLoad = proxy.onLoad;
            getResult = browser.get('index.html');

        });

        it('should make no addMockModule calls', function () {
            expect(browser.addMockModule).not.toHaveBeenCalled();
        });

        it('should not patch the browser.get() method', function () {
            expect(browser.get).toEqual(browser_get);
        });

        it('should call get once.', function () {
            expect(browser_get.calls.length).toEqual(1);
        });

        it('should call get with the passed url.', function () {
            expect(browser_get.calls[0].args[0]).toEqual('index.html');
        });

        it('should return the promise returned by get.', function () {
            expect(getResult).toEqual(PROMISE);
        });

    });

    describe('A proxy where onLoad calls were made', function () {

        var proxy, getResult;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
            proxy.onLoad.whenGET('/session-info').passThrough();
            proxy.onLoad.whenGET('/preferences').passThrough();
            getResult = browser.get('index.html');
        });

        it('should call addMockModule once', function () {
            expect(browser.addMockModule.calls.length).toEqual(1);
        });

        it('should call addMockModule with a script that adds a module that uses ngMockE2E', function () {
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                'angular.module("http-backend-proxy", ["ngMockE2E"]).run(["$httpBackend", function($httpBackend){');
        });

        it('should call addMockModule with a script that contains all the calls made to onLoad', function () {
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                '$httpBackend.whenGET("/session-info").passThrough();');
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                '$httpBackend.whenGET("/preferences").passThrough();');
        });

        it('should patch the browser.get() method', function () {
            expect(browser.get).not.toEqual(browser_get);
        });

        it('should call get once.', function () {
            expect(browser_get.calls.length).toEqual(1);
        });

        it('should call get with the passed url.', function () {
            expect(browser_get.calls[0].args[0]).toEqual('index.html');
        });

        it('should return the promise returned by get.', function () {
            expect(getResult).toEqual(PROMISE);
        });

        it('should not call executeScript.', function () {
            expect(browser.executeScript).not.toHaveBeenCalled();
        });

        describe('adding additional calls before subsequent page loads', function () {

            beforeEach(function () {
                proxy.onLoad.whenGET('/more-info').passThrough();
                browser.addMockModule.reset();
                browser.get('index.html');
            });

            it('should include all the previous calls in the onLoad script', function () {
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/session-info").passThrough();');
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/preferences").passThrough();');
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/more-info").passThrough();');
            });

            it('should add the new call to the onLoad script', function () {
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/more-info").passThrough();');
            });
        });

        describe('calling onLoad.reset()', function () {

            beforeEach(function () {
                spyOn(browser, 'removeMockModule');
                proxy.onLoad.reset();
            });

            it('should remove proxy module from the browser.', function () {
                expect(browser.removeMockModule).toHaveBeenCalledWith('http-backend-proxy');
            });

            it('should remove the browser.get() patch', function () {
                expect(browser.get).toEqual(browser_get);
            });

            it('should cause addMockModule to again not be called when browser.get is invoked.', function () {
                browser.addMockModule.reset();
                browser.get();
                expect(browser.addMockModule).not.toHaveBeenCalled();
            });

        });

        describe('and a context exists', function () {

            beforeEach(function () {
                proxy.context = 'proxy context'
                browser.addMockModule.reset();
                browser.get('index.html');
            });

            it('should call addMockModule once', function () {
                expect(browser.addMockModule.calls.length).toEqual(1);
            });

            it('should call addMockModule with a script that contains all the calls made to onLoad', function () {
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/session-info").passThrough();');
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.whenGET("/preferences").passThrough();');
            });

            it('should call addMockModule with a script that sets the context on $httpBackend', function () {
                expect(browser.addMockModule.calls[0].args[1]).toContain(
                    '$httpBackend.context="proxy context";');
            });

            describe('applying a context to onLoad', function () {

                beforeEach(function () {
                    proxy.onLoad.context = 'loader context';
                    browser.addMockModule.reset();
                    browser.get('index.html');
                });

                it('should not change the proxy context', function () {
                    expect(proxy.context).toEqual('proxy context')
                });

                it('should use the proxy context when calling addMockModule', function () {
                    expect(browser.addMockModule.calls[0].args[1]).toContain(
                        '$httpBackend.context="proxy context";');
                });
            });

            describe('changing the proxy context before subsequent page loads', function () {

                beforeEach(function () {
                    proxy.context = 'new context';
                    browser.addMockModule.reset();
                    browser.get('index.html');
                });

                it('should use the new context when calling addMockModule', function () {
                    expect(browser.addMockModule.calls[0].args[1]).toContain(
                        '$httpBackend.context="new context";');
                });
            });
        });
    });

    describe('A proxy with an alternate context field name', function () {

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {contextField: 'alternate'});
            proxy.alternate = 'proxy context';
            proxy.onLoad.whenGET(/.*/).passThrough();
            browser.get('index.html');
        });

        it('should call addMockModule once', function () {
            expect(browser.addMockModule.calls.length).toEqual(1);
        });

        it('should call addMockModule with a script that uses the alternate field name to the context on $httpBackend', function () {
            expect(browser.addMockModule.calls[0].args[1]).toContain(
                '$httpBackend.alternate="proxy context";');
        });

    });

});