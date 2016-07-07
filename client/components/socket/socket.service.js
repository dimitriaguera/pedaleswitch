/* global io */
'use strict';

angular.module('pedaleswitchApp')
  .factory('socket', function(socketFactory, OrderArray) {
    // socket.io now auto-configures its connection when we ommit a connection url
    var ioSocket = io('', {
      // Send auth token on connection, you will need to DI the Auth service above
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client'
    });

    var socket = socketFactory({ ioSocket });

    return {
      socket,
      OrderArray,

      /**
       * Register listeners to sync an array with updates on a model
       *
       * Takes the array we want to sync, the model name that socket updates are sent from,
       * and an optional callback function after new items are updated.
       *
       * @param {String} modelName
       * @param {Array} array
       * @param {Function} cb
       */
      syncUpdates(modelName, array, cb) {
        cb = cb || angular.noop;


        /**
         * Syncs item creation/updates on 'model:save'
         */
        socket.on(modelName + ':save', function (item) {
          var event;
          // Find if the obj already existe in the tab array.
          var oldItem = OrderArray.boucle(array, '_id', item._id, 3);
          
          // replace oldItem if it exists
          // otherwise just add item to the collection
          if (oldItem) {
            // Find index of the obj in array.
            oldItem.pop();
            var index = oldItem[oldItem.length - 1];
            oldItem.pop();
            // Give the sub array.
            var subArray = OrderArray.returnsubarray(array, oldItem);
            // Update the obj.
            subArray.splice(index, 1, item);
            event = 'updated';
          } else {
            event = 'created';
            if (angular.isArray(array)) {
              array.push(item);
            } else {
              array[item.type].push(item);
            }

          }

          cb(event, item, array);
        });

        /**
         * Syncs removed items on 'model:remove'
         */
        socket.on(modelName + ':remove', function (item) {
          var event = 'deleted';

          var test = _.remove(array, {_id: item._id});

          if (test.length === 0){
            var path = OrderArray.boucle(array, '_id', item._id, 3);
            path.pop();
            if (path.length > 1) {
              OrderArray.supwithpath(array, path);
            }
          }

          cb(event, item, array);
        });
      },

      /**
       * Removes listeners for a models updates on the socket
       *
       * @param modelName
       */
      unsyncUpdates(modelName) {
        socket.removeAllListeners(modelName + ':save');
        socket.removeAllListeners(modelName + ':remove');
      }
    };
  });
