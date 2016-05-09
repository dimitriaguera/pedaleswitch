'use strict';

describe('Service: OrderArray', function () {

  // load the service's module
  beforeEach(module('pedaleswitchApp'));

  // instantiate service
  var OrderArray;
  beforeEach(inject(function (_OrderArray_) {
    OrderArray = _OrderArray_;
  }));

  it('should do something', function () {
    expect(!!OrderArray).toBe(true);
  });

});
