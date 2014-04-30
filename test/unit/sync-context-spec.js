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

});