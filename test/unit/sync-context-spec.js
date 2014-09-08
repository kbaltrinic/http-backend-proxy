'use strict';

var HttpBackend = require('../lib/http-backend-proxy');
var Browser = require('./helpers/protractor-browser')

describe('The syncContext method', function(){

    var browser;

    beforeEach(function () {
        browser = new Browser();
    });

    afterEach(function () {
        browser.cleanUp();
    });

    describe('when buffering is off', function(){

        var proxy, returnValue;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {buffer: false});
            proxy.context = 'myContext';
            returnValue = proxy.syncContext();

        });

        it('should return a pending promise', function(){
            expect(returnValue.isComplete).toEqual(false);
        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript.calls[0].args[0]).toContain(
                '$httpBackend.context="myContext";');

        });

        it('should not do anything else', function(){

           expect(browser.executeScript.calls.length).toEqual(1);

        });
    });

    describe('when buffering is on', function(){

        var proxy, returnValue;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {buffer: true});
            proxy.whenGET(/.*/).respond(200);
            proxy.context = 'myContext';
            returnValue = proxy.syncContext();

        });

        it('should return a pending promise', function(){
            expect(returnValue.isComplete).toEqual(false);
        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript.calls[0].args[0]).toContain(
                '$httpBackend.context="myContext";');

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

    describe('when an alternative context field name has been configured', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {contextField: 'alternative'});
            proxy.alternative = 'alternativeContext';
            proxy.syncContext();

        });

        it('should syncronize the alternative context object to the browser', function(){

            expect(browser.executeScript.calls[0].args[0]).toContain(
                '$httpBackend.alternative="alternativeContext";');

        });
    });

    describe('when auto-syncronization of the context object is disabled', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser, {contextAutoSync: false});
            proxy.syncContext();

        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript.calls[0].args[0]).toContain(
                '$httpBackend.context={};');

        });

    });

    describe('when not local context object exists', function(){

        var proxy;

        beforeEach(function () {

            proxy = new HttpBackend(browser);
            delete proxy.context;
            proxy.syncContext();

        });

        it('should create the context object on the local proxy', function(){

            expect(proxy.context).toEqual({});

        });

        it('should syncronize the context object to the browser', function(){

            expect(browser.executeScript.calls[0].args[0]).toContain(
                '$httpBackend.context={};');

        });

    });

    describe('when an explicit context object is provided', function(){

        describe('and both the prior context and the new context are simple objects', function(){

            var proxy;

            beforeEach(function () {

                proxy = new HttpBackend(browser);
                proxy.context = { value1: 'old1', value2: 'old2'};
                proxy.syncContext({value2:'new2',value3:'new3'});

            });

            it('should syncronize the merged context object to the browser', function(){

                expect(browser.executeScript.calls[0].args[0]).toContain(
                    '$httpBackend.context={"value1":"old1","value2":"new2","value3":"new3"};');

            });

            it('should update the local context object with the merged values', function(){

                expect(proxy.context).toEqual({value1:'old1',value2:'new2',value3:'new3'});

            });

        });

        describe('and only the prior context is a simple object', function(){

            var proxy;

            beforeEach(function () {

                proxy = new HttpBackend(browser);
                proxy.context = { old: 'value'}
                //A Regex is an object but not something we would want to merge with!
                proxy.syncContext(/a regex/);

            });

            it('should syncronize the new context object to the browser', function(){

                expect(browser.executeScript.calls[0].args[0]).toContain(
                    '$httpBackend.context=new RegExp("a regex");');

            });

            it('should update the local context object with the new value', function(){

                expect(proxy.context).toEqual(/a regex/);

            });

        });


        describe('and only the new context is a simple object', function(){

            var proxy;

            beforeEach(function () {

                proxy = new HttpBackend(browser);
                //A array is also an object that we would not want to merge with.
                proxy.context = ['old', 'value'];
                proxy.syncContext({aNew: 'value'});

            });

            it('should syncronize the new context object to the browser', function(){

                expect(browser.executeScript.calls[0].args[0]).toContain(
                    '$httpBackend.context={"aNew":"value"};');

            });

            it('should update the local context object with the new value', function(){

                expect(proxy.context).toEqual({aNew: 'value'});

            });

        });

        describe('and an alternative context field name was configured', function(){

            var proxy;

            beforeEach(function () {

                proxy = new HttpBackend(browser, {contextField: 'alternate'});
                proxy.alternate = 'myContext';
                proxy.syncContext('anotherContext');

            });

            it('should syncronize the provided context object to the browser', function(){

                expect(browser.executeScript.calls[0].args[0]).toContain(
                    '$httpBackend.alternate="anotherContext";');

            });

            it('should update the local context object', function(){

                expect(proxy.alternate).toEqual('anotherContext');

            });

        });

        describe('and auto-syncronization of the context object has been disabled', function(){

            var proxy;

            beforeEach(function () {

                proxy = new HttpBackend(browser, {contextAutoSync: false});
                proxy.syncContext('anotherContext');

            });

            it('should syncronize the provided context object to the browser using the default field name', function(){

                expect(browser.executeScript.calls[0].args[0]).toContain(
                    '$httpBackend.context="anotherContext";');

            });

            it('should update the local context object', function(){

                expect(proxy.context).toEqual('anotherContext');

            });

        });

    });

});