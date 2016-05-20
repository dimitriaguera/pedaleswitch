'use strict';

describe('Service: instanceDessin', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp.instanceDessin'));

  // instantiate service
  var instanceDessin;
  beforeEach(inject(function (_instanceDessin_) {
    instanceDessin = _instanceDessin_;
  }));

  it('should do something', function () {
    expect(!!instanceDessin).toBe(true);
  });

});
