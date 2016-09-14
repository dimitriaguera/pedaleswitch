'use strict';

describe('Component: ComposantComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var ComposantComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    ComposantComponent = $componentController('ComposantComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
