/**
 * Effet model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _effet = require('./effet.model');

var _effet2 = _interopRequireDefault(_effet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EffetEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
EffetEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _effet2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    EffetEvents.emit(event + ':' + doc._id, doc);
    EffetEvents.emit(event, doc);
  };
}

exports.default = EffetEvents;
//# sourceMappingURL=effet.events.js.map
