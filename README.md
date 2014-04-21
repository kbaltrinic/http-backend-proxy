#$httpBackend Proxy
This is a node module for use with the [AngularJS Protractor][protractor] end-to-end testing framework.  It allows you to make configuration calls to [$httpBackend][httpBackend] from within Protractor itself.  Being able to configuring the mock backend along side the tests that depend upon it improves the modularity, encapsulation and flexibility of your tests.  The proxy allows $httpBackend to live up to its full potential, making it easier to test angular web applications in abstraction from their backend services.

### Credits
The proxy itself is my own work.  However much of the test application and project structure, etc. is based off of [the angular-seed project][angular-seed].  This includes significant parts of this README.

## Getting and Using the Proxy
Hopefully I will get a proper distribution set up soon.  For now, just grab the `http-backend-protractor-proxy.js` from the `test/lib` folder.  It is MIT licensed.

The proxy supports the same interface as $httpBackend so [see its docs][httpBackend] for usage.  The main difference is that all proxied methods return promises in the fashion of most other Protractor methods.  (Exception: see Buffered Mode below.)

To instantiate an instance of the proxy simply call `new HttpBackend(browser)` assuming `HttpBackend` is the name underwhich you imported the proxy.  `browser` is, of course, the protractor browser object.

See the end-to-end tests in `test/e2e` for some examples of usage.

###Buffered Mode
In addition, it is possible to use the proxy in a 'buffered' mode by passing `{buffer: true}` as the second argument to the constructor.  In this case proxied methods return void and do not immediately pass their calls through to the browser. Calling `flush()` will pass all buffered calls through to the browser at once and return a promise that will be fulfilled once all calls have been executed.

Buffering is the generally recommended approach because in most cases you will need to make numersous calls to the proxy to set things up the way you want them for a given spec.  Buffering will reduce the number of remote calls and considerably speed up your test setup.

###Resetting the Mock
The underlying $httpBackend mock does not support resetting the set of configured calls.  So there is no way to do this through the proxy either.  The simplest solution is to use `browser.get()` to reload your page.  This of course resets the entire application state, not just that of the $httpBackend.  Doing so may not seem ideal but if used wisely will give you good tests isolation as well resetting the proxy.

###Configuring the App-Under-Test
Somewhere in the application-under-test, you need to add the following line.

```JavaScript
window.$httpBackend = $httpBackend;
```
The `module.run()` block of your top-level application module is probably the best place to put this.  This exposes $httpBackend globally so that it becomes accessible to the proxy.  _If anyone has ideas on how to avoid needing this, please let me know._

## The Test-Harness Application

The angular application that makes up most of this repository is simply a test harness for the proxy.  It enables testing the proxy by way of Protractor.  However it can also be used to manualy tests the 'hard-coded' $httpBackend configuration set up in `app.js`.  Manual testing can usefull for debugging problems during proxy development.

###Setup

#### Install Dependencies

There are three kinds of dependencies in this project: tools, angular framework code and bootstrap css.  The tools help us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].
* I added `bootstrap.css` as a hardcoded dependency under `app/css` just to make the test harness look nice. :-)  Stricktly speaking it is not needed.

`npm` is preconfigured to automatically run `bower` so you can simply do:

```
npm install
```

Behind the scenes this will also call `bower install`.  You should find that you have two new
folders in your project.

* `node_modules` - contains the npm packages for the tools we need
* `bower_components` - contains the angular framework files

#### Run the Test Harness

The project is preconfigured with a simple development web server.  The simplest way to start
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
        app.js          --> the application's  angular code

    test/               --> test config and source files
      protractor-conf.js    --> config file for running e2e tests with Protractor
      e2e/                  --> end-to-end specs
        scenarios.js
      lib/
        http-backend-protractor-proxy.js  ==>This is the proxy libary that you want to grab!
      unit/                 --> unit level specs/tests (None for now)

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

### Running the End-to-End Testing

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
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[jasmine-node]: https://github.com/mhevery/jasmine-node
[http-server]: https://github.com/nodeapps/http-server
[issues]: https://github.com/kbaltrinic/http-backend-proxy/issues