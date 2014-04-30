'use strict';

var HttpBackend = require('../lib/http-backend-proxy');

describe('The syncContext method', function(){

    var browser;

    beforeEach(function () {

        browser = { executeScript: function(){} };
        spyOn(browser, 'executeScript');

    });

    describe('when buffering is off', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {buffer: false});
            proxy.context = 'myContext';
            proxy.syncContext();

        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript).toHaveBeenCalledWith(
                'window.$httpBackend.context="myContext";');

        });


        it('should not do anything else', function(){

           expect(browser.executeScript.calls.length).toEqual(1);

        });
    });

    describe('when buffering is on', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {buffer: true});
            proxy.whenGET(/.*/).respond(200);
            proxy.context = 'myContext';
            proxy.syncContext();

        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript).toHaveBeenCalledWith(
                'window.$httpBackend.context="myContext";');

        });

        it('should not do anything else', function(){

            expect(browser.executeScript.calls.length).toEqual(1);

        });

        it('especially not flush the buffer', function(){

            browser.executeScript.reset();
            proxy.flush();
            expect(browser.executeScript.calls.length).toEqual(1);

        });
    });

    describe('when and explicit context object is provided', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {buffer: true});
            proxy.context = 'myContext';
            proxy.syncContext('anotherContext');

        });

        it('should syncronize the provided context object to the browser', function(){

            expect(browser.executeScript).toHaveBeenCalledWith(
                'window.$httpBackend.context="anotherContext";');

        });

        it('should update the local context object', function(){

            expect(proxy.context).toEqual('anotherContext');

        });

        describe('and an alternative context field name is used', function(){

            beforeEach(function () {

                proxy = new HttpBackend(browser, {buffer: true, contextField: 'alternate'});
                proxy.alternate = 'myContext';
                proxy.syncContext('anotherContext');

            });

            it('should syncronize the provided context object to the browser', function(){

                expect(browser.executeScript).toHaveBeenCalledWith(
                    'window.$httpBackend.alternate="anotherContext";');

            });

            it('should update the local context object', function(){

                expect(proxy.alternate).toEqual('anotherContext');

            });

        });

    });

});