'use strict';

import * as auth from '../../auth/auth.service';
var express = require('express');
var controller = require('./userData.controller');
var router = express.Router();
var path = require('path');



router.get('/test', auth.isAuthenticated(), function (req, res) {

  var file = 'yeoman.png';
  //res.download(path.join(__dirname, 'userfile', req.user._id.toString(), file));

  res.attachment(file);

  res.sendFile(file,
    {
      root: path.join(__dirname, 'userfile', req.user._id.toString() ),
      headers: {
        'Content-Disposition': 'attachment; filename="' + file + '"'
        }
    }
  );
  // Ne pas utiliser car pas ascyncrhone ...
  // var img = fs.readFileSync(path.join(__dirname, '/userfile/57eab30412736f23e673edad/yeoman.png'));
  // res.writeHead(200, {'Content-Type': 'image/png' });
  // res.end(img, 'binary');
});



router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

// router.get('/test', function (req, res) {
//   res.sendFile('userfile/57eab30412736f23e673edad/yeoman.png');
// });



module.exports = router;
