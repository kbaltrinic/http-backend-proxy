//Used to mocks the globaly available protractor promise
var protractor = { promise: { defer: function(){
  var promise = { isComplete: false };
  return {
    promise: promise,
    fulfill: function() { promise.isComplete = true; }
  };
}}};

module.exports = function(){

  GLOBAL.protractor = protractor;

  this.executeScript =  function(){
    //calling executeScript should return a promise.
    var deferred = protractor.promise.defer();
    return deferred.promise;
  };

  spyOn(this, 'executeScript').andCallThrough();

  this.cleanUp = function(){
    delete GLOBAL.protractor;
  };
};
