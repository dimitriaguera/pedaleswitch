'use strict';

describe('Component: BibliothequeComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var BibliothequeComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    BibliothequeComponent = $componentController('BibliothequeComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
