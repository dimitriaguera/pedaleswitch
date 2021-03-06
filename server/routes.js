/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below

  app.use('/api/dummyjsons', require('./api/dummyjson'));
  app.use('/api/composanttypes', require('./api/composantType'));
  app.use('/api/caches', require('./api/cache'));
  app.use('/api/typeEffets', require('./api/typeEffet'));
  app.use('/api/effets', require('./api/effet'));
  app.use('/api/composants', require('./api/composant'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
