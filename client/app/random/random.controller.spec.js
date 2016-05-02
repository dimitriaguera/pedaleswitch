'use strict';

describe('Component: RandomComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var RandomComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    RandomComponent = $componentController('RandomComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
