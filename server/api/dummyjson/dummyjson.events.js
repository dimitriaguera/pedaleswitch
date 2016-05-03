/**
 * ComposantType model events
 */

'use strict';
import {EventEmitter} from 'events';
var DummyJsonEvents = new EventEmitter();

// Set max event listeners (0 == unlimited)
DummyJsonEvents.setMaxListeners(0);

export default DummyJsonEvents;
