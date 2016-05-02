'use strict';

var app = require('../..');
import request from 'supertest';

var newCache;

describe('Cache API:', function() {

  describe('GET /api/caches', function() {
    var caches;

    beforeEach(function(done) {
      request(app)
        .get('/api/caches')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          caches = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      caches.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/caches', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/caches')
        .send({
          name: 'New Cache',
          info: 'This is the brand new cache!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newCache = res.body;
          done();
        });
    });

    it('should respond with the newly created cache', function() {
      newCache.name.should.equal('New Cache');
      newCache.info.should.equal('This is the brand new cache!!!');
    });

  });

  describe('GET /api/caches/:id', function() {
    var cache;

    beforeEach(function(done) {
      request(app)
        .get('/api/caches/' + newCache._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          cache = res.body;
          done();
        });
    });

    afterEach(function() {
      cache = {};
    });

    it('should respond with the requested cache', function() {
      cache.name.should.equal('New Cache');
      cache.info.should.equal('This is the brand new cache!!!');
    });

  });

  describe('PUT /api/caches/:id', function() {
    var updatedCache;

    beforeEach(function(done) {
      request(app)
        .put('/api/caches/' + newCache._id)
        .send({
          name: 'Updated Cache',
          info: 'This is the updated cache!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedCache = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCache = {};
    });

    it('should respond with the updated cache', function() {
      updatedCache.name.should.equal('Updated Cache');
      updatedCache.info.should.equal('This is the updated cache!!!');
    });

  });

  describe('DELETE /api/caches/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/caches/' + newCache._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when cache does not exist', function(done) {
      request(app)
        .delete('/api/caches/' + newCache._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
