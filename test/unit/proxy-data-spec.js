'use strict';

/*
 *  These Specs provide a basic test of the buffering works as expected.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('Context', function(){

	var browser;
    var proxy;

	beforeEach(function () {

		browser = { executeScript: function(){} };
		spyOn(browser, 'executeScript');

		proxy = new HttpBackend(browser);

	});

	it('should initialize to an empty object', function(){

		expect(proxy.context).toEqual({});

	});

	it('should forwarded to the browser even if empty', function(){

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded all basic data types', function(){

		proxy.context.string  = 'A string';
		proxy.context.number  = 1;
		proxy.context.boolean = true;

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"string":"A string","number":1,"boolean":true};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded arrays', function(){

		proxy.context.array = [1,2,3];

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"array":[1,2,3]};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded objects', function(){

		proxy.context.obj = {an: 'object'};

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"obj":{"an":"object"}};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded regular expressions', function(){

		proxy.context.regex = /find me/ig

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"regex":/find me/gi};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded functions expressions', function(){

		proxy.context.func = function(n){return n++;};

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"func":function (n){return n++;}};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded regular expressions when nested in objects', function(){

		proxy.context.obj = {regex:/find me/ig};

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"obj":{"regex":/find me/gi}};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

	it('should forwarded functions expressions when nested in objects', function(){

		proxy.context.obj = {func: function(n){return n++;}};

		proxy.whenGET('/someURL').respond(200);

		expect(browser.executeScript).toHaveBeenCalledWith(
			'$httpBackend.context={"obj":{"func":function (n){return n++;}}};window.$httpBackend.whenGET("/someURL").respond(200);');

	});

});