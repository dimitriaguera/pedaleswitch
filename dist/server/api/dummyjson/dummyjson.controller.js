'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.show = show;

var _dummyjson = require('./dummyjson.events');

var _dummyjson2 = _interopRequireDefault(_dummyjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict'; /**
               * Using Rails-like standard naming convention for endpoints.
               * GET     /api/dummyjsons              ->  show
               * GET     /api/dummyjsons/:id          ->  show
               */

function show(req, res) {
  var file = req.params.id || 'default';

  return readfile(file).then(emitmes('lecture fichier ok')).then(makejson()).then(emitmes('Transforme le template en string OK')).then(parseJson()).then(emitmes('Parse Json Ok')).then(insertdbjson(res, file)).then(emitmes('db rempli ok')).catch(handleError(res));
}

function readfile(file) {
  return new _promise2.default(function (resolve, reject) {
    file = file || 'default';
    var fs = require('fs');
    fs.readFile(__dirname + '/' + file + '.hbs', { encoding: 'utf8' }, function (err, data) {
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
  return function (template) {
    return new _promise2.default(function (resolve, reject) {
      try {
        var dummyjson = require('dummy-json');

        var myHelpers = {
          composantType: function composantType() {
            // Use randomArrayItem to ensure the seeded random number generator is used
            return dummyjson.utils.randomArrayItem(['Led', 'Potar', 'Transfo']);
          },
          effetType: function effetType() {
            return dummyjson.utils.randomArrayItem(['Disto', 'Delay', 'Reverb', 'Wawa']);
          }
        };

        var result = dummyjson.parse(template, { helpers: myHelpers });
        console.log('Random Template créé');
        // console.log(result);
        resolve(result);
      } catch (err) {
        reject('Random Template non crée :' + err);
      }
    });
  };
}

function parseJson() {
  return function (json) {
    return new _promise2.default(function (resolve, reject) {
      try {
        // preserve newlines, etc - use valid JSON
        json = json.replace(/\\n/g, "\\n").replace(/\\'/g, "\\'").replace(/\\"/g, '\\"').replace(/\\&/g, "\\&").replace(/\\r/g, "\\r").replace(/\\t/g, "\\t").replace(/\\b/g, "\\b").replace(/\\f/g, "\\f");
        // remove non-printable and other non-valid JSON chars
        json = json.replace(/[\u0000-\u0019]+/g, "");
        json = JSON.parse(json);
        resolve(json);
        console.log('Parse Json ok');
      } catch (err) {
        reject('Problème Parse Json :' + err);
      }
    });
  };
}

function insertdbjson(res, file) {
  file = file || 'default';
  return function (json) {
    return new _promise2.default(function (resolve, reject) {
      var db = require('../' + file + '/' + file + '.model').default;
      db.insertMany(json, function (err, data) {
        if (err) {
          reject('Problème insertion db :' + err);
          return;
        }
        resolve('insert db ok');
        console.log('Insertion db ok');
        //console.dir(obj);
        res.status(204).end();
      });
    });
  };
}

function handleError(res) {
  return function (err) {
    console.log(err);
    res.status(500).send(err);
  };
}

function emitmes(mess) {
  return function (entity) {
    return new _promise2.default(function (resolve, reject) {
      _dummyjson2.default.emit('message', mess);
      resolve(entity);
    });
  };
}
//# sourceMappingURL=dummyjson.controller.js.map
