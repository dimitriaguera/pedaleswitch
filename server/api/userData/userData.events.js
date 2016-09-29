/**
 * Thing model events
 */

'use strict';

import {EventEmitter} from 'events';
import UserData from './userData.model';
var UserDataEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
UserDataEvents.setMaxListeners(0);

// Model events
var events = {
  'save': 'save',
  'remove': 'remove'
};

// Register the event emitter to the model events
for (var e in events) {
  var event = events[e];
  UserData.schema.post(e, emitEvent(event));
}

function emitEvent(event) {
  return function(doc) {
    UserDataEvents.emit(event + ':' + doc._id, doc);
    UserDataEvents.emit(event, doc);
  }
}

export default UserDataEvents;
