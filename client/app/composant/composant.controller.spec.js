'use strict';

describe('Component: ComposantComponent', function () {

  // load the controller's module
  beforeEach(module('pedaleswitchApp'));
  beforeEach(module('stateMock'));
  beforeEach(module('socketMock'));


  var scope;
  var ComposantComponent;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (
    _$httpBackend_,
    $http,
    $componentController,
    $rootScope,
    $state,
    socket) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/composants')
      .respond(['HTML5 Boilerplate', 'AngularJS', 'Karma', 'Express']);

    scope = $rootScope.$new();
    state = $state;
    ComposantComponent = $componentController('composant', {
      $http: $http,
      $scope: scope,
      socket: socket
    });

  }));

  it('should attach a list of composant to the controller', function () {
    ComposantComponent.$onInit();
    $httpBackend.flush();
    expect(ComposantComponent.composants.length).toBe(4);
  });
});
