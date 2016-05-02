/**
 * ComposantType model events
 */

'use strict';

import {EventEmitter} from 'events';
import ComposantType from './composantType.model';
var ComposantTypeEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
ComposantTypeEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  ComposantType.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ComposantTypeEvents.emit(event + ':' + doc._id, doc);
    ComposantTypeEvents.emit(event, doc);
  }
}

export default ComposantTypeEvents;
