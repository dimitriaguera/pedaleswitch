/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/dummyjsons              ->  show
 * GET     /api/dummyjsons/:id          ->  show
 */

import tt from './dummyjson.events';

'use strict';
export function show(req, res) {
  var file = req.params.id || 'default';

  return readfile(file)
    .then(emitmes('lecture fichier ok'))
    .then(makejson())
    .then(insertdbjson(res, file))
    .then(emitmes('db rempli'))
    .catch(handleError(res));
}

function readfile(file) {
  return new Promise(function (resolve, reject) {
    file = file || 'default';
    var fs = require('fs');
    fs.readFile(__dirname + '/' + file + '.hbs', {encoding: 'utf8'}, function(err, data) {
      if (err) {
        reject('Fichier modèle inexistant');
        return;
      }
      console.log('Lecture fichier modèle ok');
      resolve(data);
    });
  });
}

function makejson() {
  return function(template) {
    return new Promise(function (resolve, reject) {
      try{
        var dummyjson = require('dummy-json');

        var myHelpers = {
          composantType: function() {
            // Use randomArrayItem to ensure the seeded random number generator is used
            return dummyjson.utils.randomArrayItem(['Led', 'Potar', 'Transfo']);
          },
          effetType: function(){
            return dummyjson.utils.randomArrayItem(['Disto', 'Delay', 'Reverb', 'Wawa']);
          }
        };

        var result = dummyjson.parse(template, {helpers: myHelpers});
        console.log('Random Json créé');
        resolve(result);
      }
      catch(err) {
        reject('Random Json non crée :' + err);
      }
    });
  }
}

function insertdbjson(res, file) {
  file = file || 'default';
  return function(json){
    return new Promise(function (resolve, reject) {
      var db = require('../' + file + '/' + file + '.model').default;
      var obj = JSON.parse(json);
      db.insertMany(obj, function (err, data) {
        if (err) {
          reject('Problème insertion db :' + err);
        }
        resolve('insert db ok');
        console.log('Insertion db ok');
        res.status(204).end();
      });
    });
  };
}

function handleError(res) {
  return function(err) {
    console.log(err);
    res.status(500).send(err);
  };
}

function emitmes(mess) {
  return function (entity) {
    return new Promise(function (resolve, reject) {
      tt.emit('message', mess);
      resolve(entity);
    });
  };
}