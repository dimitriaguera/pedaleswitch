/**
 * Composant model events
 */

'use strict';

import {EventEmitter} from 'events';
import Composant from './composant.model';
var ComposantEvents = new EventEmitter();

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
  Composant.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    ComposantEvents.emit(event + ':' + doc._id, doc);
    ComposantEvents.emit(event, doc);
  }
}

export default ComposantEvents;
