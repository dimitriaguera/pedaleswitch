'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ComposantSchema = new _mongoose2.default.Schema({
  titre: String,
  type: String,
  description: String,
  disponible: Boolean,
  prix_additionnel: Number,
  shape: String,
  size: {
    w: Number,
    h: Number
  },
  media: []
});

exports.default = _mongoose2.default.model('Composant', ComposantSchema);
//# sourceMappingURL=composant.model.js.map
