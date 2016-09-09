'use strict';

import mongoose from 'mongoose';

var ComposantEffetSchema = new mongoose.Schema({
  type: {
    type: String,
  //  required: [true, 'Champ type du composant requis']
  },
  titre: {
    type: String,
 //   required: [true, 'Champ titre du composant requis']
  },
  available_compo_id: {
    type: Array,
 //   required: [true, 'Champ éléments autorisés requis']
  },
  pos: {
    x:{
      type: Number,
  //   required: [true, 'Champ X du composant requis']
    },
    y:{
      type: Number,
  //    required: [true, 'Champ Y du composant requis']
    }
  }
});

var OptionSchema = new mongoose.Schema({
  titre: {
    type: String,
 //   required: [true, 'Champ titre de l\'option requis']
  },
  description: {
    type: String,
 //   required: [true, 'Champ description de l\'option requis']
  },
  disponible: {
    type: Boolean,
 //   required: [true, 'Champ disponible de l\'option requis']
  },
  prix: {
    type: Number,
 //   required: [true, 'Champ prix de l\'option requis']
  },
  media: [],
  size: {
    w:{
      type: Number,
   //   required: [true, 'Champ largeur de l\'option requis']
    },
    h:{
      type: Number,
   //   required: [true, 'Champ hauteur de l\'option requis']
    }
  },
  composants: [ComposantEffetSchema]
});

var EffetSchema = new mongoose.Schema({
  type: {
    type: String,
  //  required: [true, 'Champ type d\'effet requis']
  },
  titre: {
    type: String,
  //  required: [true, 'Champ titre de l\'effet requis']
  },
  description: {
    type: String,
    required: [true, 'Champ description de l\'effet requis']
  },
  disponible: {
    type: Boolean,
  //  required: [true, 'Champ disponible de l\'effet requis']
  },
  options: [OptionSchema]
});

export default mongoose.model('Effet', EffetSchema);

