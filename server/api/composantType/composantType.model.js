'use strict';

import mongoose from 'mongoose';

var ComposantTypeSchema = new mongoose.Schema({
  titre: String
});

export default mongoose.model('ComposantType', ComposantTypeSchema);
