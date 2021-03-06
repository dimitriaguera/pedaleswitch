'use strict';

var app = require('../..');
import request from 'supertest';

var newEffet;

describe('Effet API:', function() {

  describe('GET /api/effets', function() {
    var effets;

    beforeEach(function(done) {
      request(app)
        .get('/api/effets')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          effets = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      effets.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/effets', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/effets')
        .send({
          name: 'New Effet',
          info: 'This is the brand new effet!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newEffet = res.body;
          done();
        });
    });

    it('should respond with the newly created effet', function() {
      newEffet.name.should.equal('New Effet');
      newEffet.info.should.equal('This is the brand new effet!!!');
    });

  });

  describe('GET /api/effets/:id', function() {
    var effet;

    beforeEach(function(done) {
      request(app)
        .get('/api/effets/' + newEffet._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          effet = res.body;
          done();
        });
    });

    afterEach(function() {
      effet = {};
    });

    it('should respond with the requested effet', function() {
      effet.name.should.equal('New Effet');
      effet.info.should.equal('This is the brand new effet!!!');
    });

  });

  describe('PUT /api/effets/:id', function() {
    var updatedEffet;

    beforeEach(function(done) {
      request(app)
        .put('/api/effets/' + newEffet._id)
        .send({
          name: 'Updated Effet',
          info: 'This is the updated effet!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedEffet = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEffet = {};
    });

    it('should respond with the updated effet', function() {
      updatedEffet.name.should.equal('Updated Effet');
      updatedEffet.info.should.equal('This is the updated effet!!!');
    });

  });

  describe('DELETE /api/effets/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/effets/' + newEffet._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when effet does not exist', function(done) {
      request(app)
        .delete('/api/effets/' + newEffet._id)
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
