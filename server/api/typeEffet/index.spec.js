'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var typeEffetCtrlStub = {
  index: 'typeEffetCtrl.index',
  show: 'typeEffetCtrl.show',
  create: 'typeEffetCtrl.create',
  update: 'typeEffetCtrl.update',
  destroy: 'typeEffetCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var typeEffetIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './typeEffet.controller': typeEffetCtrlStub
});

describe('TypeEffet API Router:', function() {

  it('should return an express router instance', function() {
    typeEffetIndex.should.equal(routerStub);
  });

  describe('GET /api/typeEffets', function() {

    it('should route to typeEffet.controller.index', function() {
      routerStub.get
        .withArgs('/', 'typeEffetCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/typeEffets/:id', function() {

    it('should route to typeEffet.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'typeEffetCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/typeEffets', function() {

    it('should route to typeEffet.controller.create', function() {
      routerStub.post
        .withArgs('/', 'typeEffetCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/typeEffets/:id', function() {

    it('should route to typeEffet.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'typeEffetCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/typeEffets/:id', function() {

    it('should route to typeEffet.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'typeEffetCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/typeEffets/:id', function() {

    it('should route to typeEffet.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'typeEffetCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
