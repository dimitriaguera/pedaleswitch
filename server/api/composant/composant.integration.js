'use strict';

var app = require('../..');
import request from 'supertest';

var newComposant;

describe('Composant API:', function() {

  describe('GET /api/composants', function() {
    var composants;

    beforeEach(function(done) {
      request(app)
        .get('/api/composants')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          composants = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      composants.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/composants', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/composants')
        .send({
          name: 'New Composant',
          info: 'This is the brand new composant!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newComposant = res.body;
          done();
        });
    });

    it('should respond with the newly created composant', function() {
      newComposant.name.should.equal('New Composant');
      newComposant.info.should.equal('This is the brand new composant!!!');
    });

  });

  describe('GET /api/composants/:id', function() {
    var composant;

    beforeEach(function(done) {
      request(app)
        .get('/api/composants/' + newComposant._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          composant = res.body;
          done();
        });
    });

    afterEach(function() {
      composant = {};
    });

    it('should respond with the requested composant', function() {
      composant.name.should.equal('New Composant');
      composant.info.should.equal('This is the brand new composant!!!');
    });

  });

  describe('PUT /api/composants/:id', function() {
    var updatedComposant;

    beforeEach(function(done) {
      request(app)
        .put('/api/composants/' + newComposant._id)
        .send({
          name: 'Updated Composant',
          info: 'This is the updated composant!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedComposant = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedComposant = {};
    });

    it('should respond with the updated composant', function() {
      updatedComposant.name.should.equal('Updated Composant');
      updatedComposant.info.should.equal('This is the updated composant!!!');
    });

  });

  describe('DELETE /api/composants/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/composants/' + newComposant._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when composant does not exist', function(done) {
      request(app)
        .delete('/api/composants/' + newComposant._id)
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
