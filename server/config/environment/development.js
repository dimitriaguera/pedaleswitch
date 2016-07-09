'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/pedaleswitch-dev'
  },

    port:   process.env.OPENSHIFT_NODEJS_PORT ||
          process.env.PORT ||
          8080,
  // Seed database on startup
  seedDB: true

};
