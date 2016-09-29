'use strict';

import mongoose from 'mongoose';

var UserDataSchema = new mongoose.Schema({
  file: String,
});

export default mongoose.model('UserData', UserDataSchema);