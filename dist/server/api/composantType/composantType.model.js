'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ComposantTypeSchema = new _mongoose2.default.Schema({
  titre: String
});

exports.default = _mongoose2.default.model('ComposantType', ComposantTypeSchema);
//# sourceMappingURL=composantType.model.js.map
