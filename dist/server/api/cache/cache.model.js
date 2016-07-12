'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CacheComposantEffetSchema = new _mongoose2.default.Schema({
  titre: String,
  available_compo_id: [],
  coordonnées: {
    x: Number,
    y: Number
  }
});

var CacheOptionSchema = new _mongoose2.default.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  dimensions: {
    w: Number,
    h: Number
  },
  composants: [CacheComposantEffetSchema]
});

var CacheSchema = new _mongoose2.default.Schema({
  titre: String,
  description: String,
  type: String,
  disponible: Boolean,
  options: [CacheOptionSchema]
});

exports.default = _mongoose2.default.model('Cache', CacheSchema);
//# sourceMappingURL=cache.model.js.map
