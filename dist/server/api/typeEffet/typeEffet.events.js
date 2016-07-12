/**
 * TypeEffet model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _typeEffet = require('./typeEffet.model');

var _typeEffet2 = _interopRequireDefault(_typeEffet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TypeEffetEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
TypeEffetEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _typeEffet2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    TypeEffetEvents.emit(event + ':' + doc._id, doc);
    TypeEffetEvents.emit(event, doc);
  };
}

exports.default = TypeEffetEvents;
//# sourceMappingURL=typeEffet.events.js.map
