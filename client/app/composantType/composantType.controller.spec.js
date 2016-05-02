'use strict';

describe('Component: ComposantTypeComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var ComposantTypeComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    ComposantTypeComponent = $componentController('ComposantTypeComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
