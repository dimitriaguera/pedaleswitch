/**
 * Broadcast updates to client when the model changes
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.register = register;

var _dummyjson = require('./dummyjson.events');

var _dummyjson2 = _interopRequireDefault(_dummyjson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Model events to emit
var events = ['message'];

function register(socket) {
  // Bind model events to socket events
  for (var i = 0, eventsLength = events.length; i < eventsLength; i++) {
    var event = events[i];
    var listener = createListener('DummyJsonEvents:' + event, socket);

    _dummyjson2.default.on(event, listener);
    socket.on('disconnect', removeListener(event, listener));
  }
}

function createListener(event, socket) {
  return function (doc) {
    socket.emit(event, doc);
  };
}

function removeListener(event, listener) {
  return function () {
    _dummyjson2.default.removeListener(event, listener);
  };
}
//# sourceMappingURL=dummyjson.socket.js.map
