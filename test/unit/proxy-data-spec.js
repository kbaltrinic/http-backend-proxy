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
});