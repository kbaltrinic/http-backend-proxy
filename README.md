#http-backend-protractor-proxy
This is a node module for use with the [AngularJS Protractor][protractor] end-to-end testing framework.  It enables you to make configuration calls to [$httpBackend][httpBackend] from within Protractor tests.  By doing so it is possible to write Protractor tests that just test an angular web application in abstraction from its backend rest services.

### Credits
The proxy itself is my own work.  However much of the test application and project structure, etc. is based off of [the angular-seed project][angular-seed].  This includes a lot of this README.

## Getting and Using the Proxy
Hopefully I will get a proper distribution set up soon.  For now, just grab the `http-backend-protractor-proxy.js` from the `test/lib` folder.  It is MIT licensed.

The proxy supports the same interface as $httpBackend so [see its docs][httpBackend] for usage.  The only difference is that all proxied methods return promises in the fashion of most other Protractor methods.  See the end-to-end tests in `test/e2e` for some examples of its usage.

###Configuring the App-Under-Test
Somewhere in the AUT, you need to add the following line.

```JavaScript
window.$httpBackend = $httpBackend;
```
The `module.run()` block of your top-level application module is probably the best place to put this.  This exposes $httpBackend globally so that it becomes accessible to the proxy.  _If anyone has ideas on how to avoid needing this, please let me know._

## The Test-Harness Application

The angular application primarily exists that makes up most of this project is simply a test harness.  It is there to enable testing of the proxy by means of Protractor tests.  However it can also be used to manualy tests the 'hard-coded' $httpBackend configuration set up in `app.js`.  Manual testing can usefull for debugging problems during proxy development.

###Setup

#### Install Dependencies

There are three kinds of dependencies in this project: tools and angular framework code.  The tools help
us manage and test the application.

* We get the tools we depend upon via `npm`, the [node package manager][npm].
* We get the angular code via `bower`, a [client-side code package manager][bower].
* I added `bootstrap.css` as a hardcoded dependency under `app/css` just to make the test harness look nice. :-)

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
      index.html        --> test app allows manual and Protractor based testing of $httpBackend configuration.
      js/               --> javascript files
        app.js          --> application

    test/               --> test config and source files
      protractor-conf.js    --> config file for running e2e tests with Protractor
      e2e/                  --> end-to-end specs
        scenarios.js
      lib/
        http-backend-protractor-proxy.js  ==>This is the proxy libary that you want to grab!
      karma.conf.js         --> config file for running unit tests with Karma
      unit/                 --> unit level specs/tests (None for now)

## Testing

There are two kinds of tests in the project: Unit tests and End to End tests.

### Running Unit Tests
**NOTE**: There are no unit tests currently.  Just the end-to-end tests.  What follows is just the verbiage from the angluar-seed app.

The project comes preconfigured with unit tests. These are written in
[Jasmine][jasmine], which we run with the [Karma Test Runner][karma]. A Karma
configuration file is provided to run them.

* the configuration is found at `test/karma.conf.js`
* the unit tests are found in `test/unit/`.

The easiest way to run the unit tests is to use the supplied npm script:

```
npm test
```

This script will start the Karma test runner to execute the unit tests. Moreover, Karma will sit and
watch the source and test files for changes and then re-run the tests whenever any of them change.
This is the recommended strategy; if you unit tests are being run every time you save a file then
you receive instant feedback on any changes that break the expected code functionality.

You can also ask Karma to do a single run of the tests and then exit.  This is useful if you want to
check that a particular version of the code is operating as expected.  The project contains a
predefined script to do this:

```
npm run test-single-run
```


### End to End Testing

The project comes with end-to-end tests, again written in [Jasmine][jasmine]. These tests
are run with the Protractor End-to-End test runner.  These tests demonstrate how to actually use the proxy to manipulate $httpBackend in your tests.  I recommend taking a look.

* the configuration is found at `test/protractor-conf.js`
* the end-to-end tests are found in `test/e2e/`

First start the test harness.

```
npm start
```

In addition, since Protractor is built upon WebDriver we need to install this.  The angular-seed
project comes with a predefined script to do this:

```
npm run update-webdriver
```

This will download and install the latest version of the stand-alone WebDriver tool.

Once you have ensured that the development web server hosting our application is up and running
and WebDriver is updated, you can run the end-to-end tests using the supplied npm script:

```
npm run protractor
```

This script will execute the end-to-end tests against the application being hosted on the
development server.


[angular-seed]: https://github.com/angular/angular-seed
[httpBackend]: http://docs.angularjs.org/api/ngMockE2E/service/$httpBackend
[bower]: http://bower.io
[npm]: https://www.npmjs.org/
[node]: http://nodejs.org
[protractor]: https://github.com/angular/protractor
[jasmine]: http://pivotal.github.com/jasmine/
[karma]: http://karma-runner.github.io
[http-server]: https://github.com/nodeapps/http-server