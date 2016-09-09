'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ComposantEffetSchema = new _mongoose2.default.Schema({
  type: String,
  titre: String,
  available_compo_id: [],
  pos: {
    x: Number,
    y: Number
  }
});

var OptionSchema = new _mongoose2.default.Schema({
  titre: String,
  description: String,
  disponible: Boolean,
  prix: Number,
  media: [],
  size: {
    w: Number,
    h: Number
  },
  composants: [ComposantEffetSchema]
});

var EffetSchema = new _mongoose2.default.Schema({
  type: String,
  titre: String,
  description: String,
  disponible: Boolean,
  options: [OptionSchema]
});

exports.default = _mongoose2.default.model('Effet', EffetSchema);
//# sourceMappingURL=effet.model.js.map
