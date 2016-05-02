'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var composantTypeCtrlStub = {
  index: 'composantTypeCtrl.index',
  show: 'composantTypeCtrl.show',
  create: 'composantTypeCtrl.create',
  update: 'composantTypeCtrl.update',
  destroy: 'composantTypeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var composantTypeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './composantType.controller': composantTypeCtrlStub
});

describe('ComposantType API Router:', function() {

  it('should return an express router instance', function() {
    composantTypeIndex.should.equal(routerStub);
  });

  describe('GET /api/composantTypes', function() {

    it('should route to composantType.controller.index', function() {
      routerStub.get
        .withArgs('/', 'composantTypeCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/composantTypes/:id', function() {

    it('should route to composantType.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'composantTypeCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/composantTypes', function() {

    it('should route to composantType.controller.create', function() {
      routerStub.post
        .withArgs('/', 'composantTypeCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/composantTypes/:id', function() {

    it('should route to composantType.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'composantTypeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/composantTypes/:id', function() {

    it('should route to composantType.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'composantTypeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/composantTypes/:id', function() {

    it('should route to composantType.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'composantTypeCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
