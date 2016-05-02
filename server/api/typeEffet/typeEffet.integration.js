'use strict';

var app = require('../..');
import request from 'supertest';

var newTypeEffet;

describe('TypeEffet API:', function() {

  describe('GET /api/typeEffets', function() {
    var typeEffets;

    beforeEach(function(done) {
      request(app)
        .get('/api/typeEffets')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          typeEffets = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      typeEffets.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/typeEffets', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/typeEffets')
        .send({
          name: 'New TypeEffet',
          info: 'This is the brand new typeEffet!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newTypeEffet = res.body;
          done();
        });
    });

    it('should respond with the newly created typeEffet', function() {
      newTypeEffet.name.should.equal('New TypeEffet');
      newTypeEffet.info.should.equal('This is the brand new typeEffet!!!');
    });

  });

  describe('GET /api/typeEffets/:id', function() {
    var typeEffet;

    beforeEach(function(done) {
      request(app)
        .get('/api/typeEffets/' + newTypeEffet._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          typeEffet = res.body;
          done();
        });
    });

    afterEach(function() {
      typeEffet = {};
    });

    it('should respond with the requested typeEffet', function() {
      typeEffet.name.should.equal('New TypeEffet');
      typeEffet.info.should.equal('This is the brand new typeEffet!!!');
    });

  });

  describe('PUT /api/typeEffets/:id', function() {
    var updatedTypeEffet;

    beforeEach(function(done) {
      request(app)
        .put('/api/typeEffets/' + newTypeEffet._id)
        .send({
          name: 'Updated TypeEffet',
          info: 'This is the updated typeEffet!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedTypeEffet = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedTypeEffet = {};
    });

    it('should respond with the updated typeEffet', function() {
      updatedTypeEffet.name.should.equal('Updated TypeEffet');
      updatedTypeEffet.info.should.equal('This is the updated typeEffet!!!');
    });

  });

  describe('DELETE /api/typeEffets/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/typeEffets/' + newTypeEffet._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when typeEffet does not exist', function(done) {
      request(app)
        .delete('/api/typeEffets/' + newTypeEffet._id)
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
