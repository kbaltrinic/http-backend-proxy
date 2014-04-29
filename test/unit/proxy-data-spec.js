'use strict';

/*
 *  These Specs provide a basic test of the buffering works as expected.
 */

var HttpBackend = require('../lib/http-backend-proxy');

describe('Context', function(){

	var browser;

	beforeEach(function () {

		browser = { };

	});

	it('should initialize to an empty object', function(){

		var proxy = new HttpBackend(browser, {buffer: false});
		expect(proxy.context).toEqual({});

	});

});