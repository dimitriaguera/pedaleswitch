'use strict';

describe('Component: OptionsComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var OptionsComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    OptionsComponent = $componentController('OptionsComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
