/**
 * ComposantType model events
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _events = require('events');

var DummyJsonEvents = new _events.EventEmitter();

// Set max event listeners (0 == unlimited)
DummyJsonEvents.setMaxListeners(0);

exports.default = DummyJsonEvents;
//# sourceMappingURL=dummyjson.events.js.map
