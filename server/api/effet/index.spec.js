'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var effetCtrlStub = {
  index: 'effetCtrl.index',
  show: 'effetCtrl.show',
  create: 'effetCtrl.create',
  update: 'effetCtrl.update',
  destroy: 'effetCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var effetIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './effet.controller': effetCtrlStub
});

describe('Effet API Router:', function() {

  it('should return an express router instance', function() {
    effetIndex.should.equal(routerStub);
  });

  describe('GET /api/effets', function() {

    it('should route to effet.controller.index', function() {
      routerStub.get
        .withArgs('/', 'effetCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/effets/:id', function() {

    it('should route to effet.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'effetCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/effets', function() {

    it('should route to effet.controller.create', function() {
      routerStub.post
        .withArgs('/', 'effetCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/effets/:id', function() {

    it('should route to effet.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'effetCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/effets/:id', function() {

    it('should route to effet.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'effetCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/effets/:id', function() {

    it('should route to effet.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'effetCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
