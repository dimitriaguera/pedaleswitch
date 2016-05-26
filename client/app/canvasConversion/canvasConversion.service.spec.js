'use strict';

describe('Service: canvasConversion', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var canvasConversion;
  beforeEach(inject(function (_canvasConversion_) {
    canvasConversion = _canvasConversion_;
  }));

  it('should do something', function () {
    expect(!!canvasConversion).toBe(true);
  });

});
