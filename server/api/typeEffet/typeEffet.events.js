/**
 * TypeEffet model events
 */

'use strict';

import {EventEmitter} from 'events';
import TypeEffet from './typeEffet.model';
var TypeEffetEvents = new EventEmitter();

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
  TypeEffet.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    TypeEffetEvents.emit(event + ':' + doc._id, doc);
    TypeEffetEvents.emit(event, doc);
  }
}

export default TypeEffetEvents;
