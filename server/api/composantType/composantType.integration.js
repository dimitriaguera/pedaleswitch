'use strict';

var app = require('../..');
import request from 'supertest';

var newComposantType;

describe('ComposantType API:', function() {

  describe('GET /api/composantTypes', function() {
    var composantTypes;

    beforeEach(function(done) {
      request(app)
        .get('/api/composantTypes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          composantTypes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      composantTypes.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/composantTypes', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/composantTypes')
        .send({
          titre: 'New ComposantType',
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newComposantType = res.body;
          done();
        });
    });

    it('should respond with the newly created composantType', function() {
      newComposantType.titre.should.equal('New ComposantType');
    });

  });

  describe('GET /api/composantTypes/:id', function() {
    var composantType;

    beforeEach(function(done) {
      request(app)
        .get('/api/composantTypes/' + newComposantType._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          composantType = res.body;
          done();
        });
    });

    afterEach(function() {
      composantType = {};
    });

    it('should respond with the requested composantType', function() {
      composantType.titre.should.equal('New ComposantType');
    });

  });

  describe('PUT /api/composantTypes/:id', function() {
    var updatedComposantType;

    beforeEach(function(done) {
      request(app)
        .put('/api/composantTypes/' + newComposantType._id)
        .send({
          titre: 'Updated ComposantType',
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedComposantType = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedComposantType = {};
    });

    it('should respond with the updated composantType', function() {
      updatedComposantType.titre.should.equal('Updated ComposantType');
    });

  });

  describe('DELETE /api/composantTypes/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/composantTypes/' + newComposantType._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when composantType does not exist', function(done) {
      request(app)
        .delete('/api/composantTypes/' + newComposantType._id)
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
