'use strict';

describe('Component: PageDessinComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));

  var PageDessinComponent, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController, $rootScope) {
    scope = $rootScope.$new();
    PageDessinComponent = $componentController('PageDessinComponent', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
