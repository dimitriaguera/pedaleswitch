/**
 * Cache model events
 */

'use strict';

import {EventEmitter} from 'events';
import Cache from './cache.model';
var CacheEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
CacheEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  Cache.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    CacheEvents.emit(event + ':' + doc._id, doc);
    CacheEvents.emit(event, doc);
  }
}

export default CacheEvents;
