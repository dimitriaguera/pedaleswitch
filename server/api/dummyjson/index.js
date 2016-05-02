'use strict';

var express = require('express');
var controller = require('./dummyjson.controller');

var router = express.Router();

router.get('/', controller.show);
router.get('/:id', controller.show);


module.exports = router;
