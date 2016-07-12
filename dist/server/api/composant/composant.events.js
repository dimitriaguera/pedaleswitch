/**
 * Composant model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var _composant = require('./composant.model');

var _composant2 = _interopRequireDefault(_composant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ComposantEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
ComposantEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  _composant2.default.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function (doc) {
    ComposantEvents.emit(event + ':' + doc._id, doc);
    ComposantEvents.emit(event, doc);
  };
}

exports.default = ComposantEvents;
//# sourceMappingURL=composant.events.js.map
