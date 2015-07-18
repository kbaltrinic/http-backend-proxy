#$httpBackend Proxy
[![Build Status](https://travis-ci.org/kbaltrinic/http-backend-proxy.svg?branch=master)](https://travis-ci.org/kbaltrinic/http-backend-proxy)

This is a node module for use with the [AngularJS Protractor][protractor] end-to-end testing framework.  It allows you to make configuration calls to [$httpBackend][httpBackend] from within Protractor itself as well as share data and functions between the test environment and the browser.  Being able to configuring the mock back end along side the tests that depend upon it improves the modularity, encapsulation and flexibility of your tests.  The proxy allows $httpBackend to live up to its full potential, making it easier to test angular web applications in abstraction from their back end services.

### Credits
The proxy itself is my own work.  However much of the test application and project structure, etc. is based off of [the angular-seed project][angular-seed].  This includes significant parts of this README.

###Release Notes and Documentation
See the [wiki](https://github.com/kbaltrinic/http-backend-proxy/wiki/Release-Notes) for release note.  Documentation is in the process of being moved from this readme (which is getting too long) to the wiki.  If you are reading this on NPM, I recommend you [look on github](https://github.com/kbaltrinic/http-backend-proxy/blob/master/README.md) for the most recent version.  Documentation often gets updated/improved there without a release to NPM.

The proxy has been tested with the lastest .x versions of the Angular.js from the 1.2, 1.3 and 1.4 series through 1.4.3.  It has been tested with the latest .x versions of Protractor from the 0.24, 1.8 and 2.1 series through 2.1.0.

## Getting and Using the Proxy
The proxy is [available via npm](https://www.npmjs.org/package/http-backend-proxy) and can be installed into your project by calling `npm install http-backend-proxy` or better yet, just add `http-backend-proxy` to devDependencies in your `package.json` file.  The current version is 1.4.2 and is released under the MIT license.  Source code can be found on [GitHub](https://github.com/kbaltrinic/http-backend-proxy).

To instantiate an instance of the proxy, require it and create a new instance:
```JavaScript
var HttpBackend = require('http-backend-proxy');
var proxy = new HttpBackend(browser);
```
`browser` is, of course, the protractor browser object.  A configuration object may be passed as a second argument to the constructor.  Available configuration options are discussed where appropriate below.

The proxy supports the same basic interface as Angular's $httpBackend so [start with its docs][httpBackend].  Note that all proxied methods return promises in the fashion of most other Protractor methods except when buffering is turned on. (See Buffered Mode below.)  Beyond the $httpBackend API, the proxy adds a few additional methods which are discussed in the following sections.

See the end-to-end tests in `test/e2e` for some examples of usage.

###Buffered Mode
It is possible to use the proxy in a 'buffered' mode by adding `buffer: true` to the configuration object passed to proxy constructor.  When buffering is enabled, proxied methods return void and do not immediately pass their calls through to the browser. Calling `flush()` will pass all buffered calls through to the browser at once and return a promise that will be fulfilled after all calls have been executed.

Buffering is the generally recommended approach because in most cases you will need to make numerous calls to the proxy to set things up the way you want them for a given spec.  Buffering will reduce the number of remote calls and considerably speed up your test setup.

###Calling Functions and Sharing Data between Tests and Browser
Using the proxy to configure $httpBackend for simple calls is, well, simple:
```JavaScript
proxy.whenGET('/logoff').respond(200);
```
But what if I want to return some big piece of JSON?  If we were coding our test in the browser we might write something like:
```JavaScript
var searchResults = require('./mock-data/searchResults.json');
$httpBackend.whenGET('/search&q=beatles').respond(200, searchResults)
```
This too will work just fine as long as at the time you call `respond()` on the proxy, searchResults resolves to a JSON object (or anything you would expect to find in a JSON object: strings, numbers, regular expressions, arrays, etc.)

To get a little fancier, you can even do this:
```JavaScript
proxy.when('GET', /.*/)
    .respond(function(method, url){return [200, 'You called: ' + url];});
```
The proxy will serialize the function and send it up to the browser for execution.

But what about:
```JavaScript
var searchResults = require('./mock-data/searchResults.json');

function getQueryTermsFrom(url){  ... implementation omitted ... };

proxy.when('GET', /search\?q=.*/)
    .respond(function(method, url){
      var term = getQueryTermFrom(url);
      var fixedUpResponse = searchResults.replace(/__TERM__/, term);
      return [200, fixedUpResponse];
    });
```
Now we have a problem.  The proxy can serialize the function just fine and send it to the browser, but when it gets there, `getQueryTermFrom` and `searchResults` are not going to resolve.  This calls for...

####Using the Context Object
The proxy provides a special object called the context object that is intended to help out in theses kinds of situations.  The context object is a property of the proxy, called `context` oddly enough, the value of which will be synchronized between the proxy and the browser-side $httpBackend before any proxied calls are executed on the browser.  With this object in place we can now do the following:

```JavaScript
var searchResults = require('./mock-data/searchResults.json');

proxy.context = {
  searchResults: searchResults,
  getQueryTermsFrom: function (url){  ... implementation omitted ... };
}

proxy.when('GET', /search\?q=.*/)
    .respond(function(method, url){
      var term = $httpBackend.context.getQueryTermFrom(url);
      var fixedUpResponse = $httpBackend.context.searchResults.replace(/__TERM__/, term);
      return [200, fixedUpResponse];
    });
```

*Hint:* If we rename our in-test proxy from `proxy` to `$httpBackend`, our tests will more easily get through any linting we may have set up.

Two caveats to the above: First, the context is limited to the following data types: strings, numbers, booleans, null, regular expresions, dates, functions, and arrays and hashes (simple objects) that in turn contain only said types, including further arrays and/or hashes.  Second, any functions defined on the context object (`getQueryTermsFrom` in our example) must themselves either be self-contained or only reference other functions and values on the context object (or available globally in the browser, but lets not go there...)

When buffering is turned off, the context object is synchronized with the browser before every call to `respond()`.  When buffering is turned on, this synchronization occurs as part of the call to `flush()`.  This is important, because it is the value of the context object at the time of synchronization, not at the point when `respond()` is called on the proxy, that determines its value in the browser.  More precisely, since values in the context object may not even be evaluated in the browser until an HTTP call occurs, the value at the time of the HTTP call will be the value of the object as of the most recent prior synchronization.  Said another way, there is no closure mechanism in play here.  Because of this behavior, it is also possible to manually synchronized the context object at any time.  See below for how and why you might want to do this.

####Configuring the Context Object
If for some reason you don't like your context object being called 'context' (or more importantly, if 'context' should turn out to conflict with a future property of $httpBackend), it can be renamed by adding `contextField: "a-new-field-name"` to the configuration object that the proxy is constructed with.  You can also disable the auto-synchronization of the context object described above by passing `contextAutoSync: false`.  If you do, you will need to manually invoke synchronization.

####Manually Synchronizing Contexts
The state of the context object can be synchronized manually at any time by calling `proxy.syncContext()`.  This does not flush the buffer or otherwise send any new configuration to the remote $httpBackend instance.  It simply synchronizes the state of the local and in-browser context objects.  `syncContext` returns a promise.

Why do this?  Consider the above example where we have a search URL whose return value is essentially defined as context.searchResults.  If we can update the context in between tests, we can effectively cause search to return different results for each test.  This makes it easy, for example, to test for correct behavior when some, none, and more-than-expected results are returned.

To avoid having to write this awkward code:
```JavaScript
proxy.context = {
  searchResults: searchResults,
  getQueryTermsFrom: function (url){  ... implementation omitted ... };
}

proxy.when( ... );

... do some tests ...

proxy.context.searchResults = emptyResults;
proxy.syncContext();

... do some more tests ...

//rinse, wash, repeat...
```
you can pass the new context directly to syncContext like so:
```JavaScript
proxy.syncContext({searchResults: emptyResults});
```
The above will *merge* the provided object with any existing context and synchronize the result.  Merging allows you to avoid re-specifying the entire context object.  Calling `syncContext` in this manner also updates the instance of the context object on the local proxy as well.

Note that the merge behavior only works if both the current and newly provided values are simple javascript objects.  If either value is anything but, then simple assignment is used and the value passed to `syncContext` will completely replace the prior value.  Examples of javascript objects that are not 'simple' and will not be merged are arrays, dates, regular expressions and pretty much anything created with the new keyword.  Except for arrays and regular expressions, you shouldn't be using most of these anyway as they would never be returned from an HTTP call.  The proxy would likely not correctly serialize them either.

Moreover, merging is only performed for the top-level object.  Nested objects are treated atomically and simply replaced.

If any of this is confusing the [syncContext unit tests](https://github.com/kbaltrinic/http-backend-proxy/blob/master/test/unit/sync-context-spec.js) may help clear it up and give detailed examples of the behavior.

###Configuring $httpBackend upon Page Load
All of the above works great for setting up mock HTTP responses for calls that will be made in response to user interaction with a loaded page.  But what about mocking data that your Angular application requests upon page load?  The proxy supports doing this through its `onLoad` qualifier.  Any configuration of the $httpBackend that needs to happen as part of the Angular applications initialization should be specified as follows:

```JavaScript
proxy.onLoad.when(...).respond(...);
```
All calls to $httpBackend that are set up in this manner will be buffered and sent to the browser using Protractor's [addMockModule][addMockModule] capability.  The proxy hooks into the `browser.get()` method such that when your tests call `get()`, the proxy gathers all calls made to `onLoad...` and wraps them in an Angular module that will execute them in its `run()` callback.  The proxy also makes the current value of its context object available within the callback such that it can be reference in the same manner as with post-load calls.

Calls made using the `onLoad` qualifier are cumulative.  For example:

```JavaScript
proxy.onLoad.whenGET('/app-config').respond(...);
browser.get('index.html');
//The /app-config endpoint is configured as part of initializing the index.html page

... do some tests...

proxy.onLoad.whenGET('/user-prefs').respond(...);
browser.get('my-account.html');
//The /app-config and /user-prefs endpoints are both configured as part of initializing the my-accounts.html page

... more tests ...

```
When this is not desired, it is possible to reset the proxy's buffer of commands to send upon page load by calling `proxy.onLoad.reset()`.  This also releases the hook into `browser.get()` which the proxy creates when a call is registered using `onLoad`.  *To ensure that tests using onLoad do not impact other tests, it is highly recommended that `reset()` be called as part of test clean-up for any tests that use `onLoad`.  Further, protractor versions prior to 0.19.0 do not support the `browser.removeMockModule()` method which `reset` uses.  Reset will silently fail to remove the module in this case.  If you are using a protractor version prior to 0.19.0 you can invoke `browser.clearMockModules()` yourself and deal with the consequences, if any, of having all modules removed.  For this reason, use of `onLoad` with earlier versions of Protractor is not recommended.*

Note that the buffer used for calls against `onLoad` is separate from the buffer for calls made directly against the proxy (when buffering is enabled).  Only the former buffer is resettable.

Again, [looking at the tests](https://github.com/kbaltrinic/http-backend-proxy/blob/master/test/unit/onLoad-spec.js) should help clarify the proxy's `onLoad` behavior.

###Resetting the Mock
The underlying $httpBackend mock does not support resetting the set of configured calls.  So there is no way to do this through the proxy either.  The simplest solution is to use `browser.get()` to reload your page.  This of course resets the entire application state, not just that of the $httpBackend.  Doing so may not seem ideal but if used wisely will give you good test isolation as well resetting the proxy.  Alternately, you can use the techniques described under context synchronization above to modify the mock's behavior for each test.

## The Test-Harness Application

The angular application that makes up most of this repository is simply a test harness for the proxy.  It enables testing the proxy by way of Protractor.  However it can also be used to manually tests the 'hard-coded' $httpBackend configuration set up in `app.js`.  Manual testing can useful for debugging problems during proxy development.

Chance are, unless you plan to contribute to the development of http-backend-proxy, you will never need to load the test harness and can safely skip this section.

###Setup

#### Install Dependencies

There are three kinds of dependencies in this project: tools, angular framework code and bootstrap css.  The tools help us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].
* I added `bootstrap.css` as a hard-coded dependency under `app/css` just to make the test harness look nice. :-)  Strictly speaking it is not needed.

None of these dependencies are needed for http-backend-proxy itself.  They are only needed for the test harness.  Thus the project is configured to only install the npm dependencies if you specify the `--dev` option on your `npm install` command.  Likewise, the bower dependencies are installed when you do `npm run` (below) to start the test harness for the first time.


Once the node (npm) modules and bower moduels are installed, you should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `bower_components` - contains the angular framework files

#### Run the Test Harness

The project is preconfigured with a simple development web server to host the test harness.  The simplest way to start
this server is:

```
npm start
```

Now browse to the app at `http://localhost:8000/app/index.html`.


### Directory Layout

    app/                --> all of the files to be used in production
      css/              --> css files
        app.css         --> default stylesheet
        bootstrap.css   --> bootstrap stylesheet
      index.html        --> that test app's single page and view.
      js/               --> javascript files
        app.js          --> the application's angular code

    test/               --> test config and source files
      protractor-conf.js    --> config file for running e2e tests with Protractor
      e2e/                  --> end-to-end specs
        ...
      lib/
        http-backend-proxy.js  ==>This is the proxy library itself.
      unit/                 --> unit level specs/tests
        ...

## Testing

There are two kinds of tests in the project: Unit tests and end-to-end tests.

### Running the Unit Tests

The project contains unit tests for testing the proxy behavior in abstraction from Protractor and Selenium.  These are written in [Jasmine][jasmine] and run using the [Jasmine-Node][jasmine-node] test runner.

* the unit tests are found in `test/unit/`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Jasmine-Node test runner to execute the unit tests.

If you are actually doing development work on the proxy itself (Thank you!) and want to run the tests continuously as you work, use the following command line.


```
npm run test-watch
```

This will watch both the `test/unit` and `test/lib` directories.

### Running the End-to-End Tests

The project comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run using Protractor.  They also demonstrate how to actually use the proxy to manipulate $httpBackend in your tests.  I recommend taking a look.

* the configuration is found at `test/protractor-conf.js`
* the end-to-end tests are found in `test/e2e/`

To run them, first start the test harness.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting the test harness is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run e2e
```

This script will execute the end-to-end tests against the application being hosted on the
development server.

##Feedback and Support
To provide feedback or get support, please [post an issue][issues] on the  GitHub project.

[angular-seed]: https://github.com/angular/angular-seed
[httpBackend]: http://docs.angularjs.org/api/ngMockE2E/service/$httpBackend
[addMockModule]: https://github.com/angular/protractor/blob/master/docs/api.md#protractorprototypeaddmockmodule
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[jasmine-node]: https://github.com/mhevery/jasmine-node
[http-server]: https://github.com/nodeapps/http-server
[issues]: https://github.com/kbaltrinic/http-backend-proxy/issues