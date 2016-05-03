'use strict';

describe('Component: AddeffetComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var AddeffetComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    AddeffetComponent = $componentController('AddeffetComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
