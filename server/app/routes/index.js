'use strict';
var router = require('express').Router();
module.exports = router;

router.use('/members', require('./members'));
router.use('/users', require('./users'));
router.use('/tx', require('./tx'));
router.use('/blocks', require('./block'));
router.use('/chain', require('./chain'));



// Make sure this is after all of
// the registered routes!
router.use(function (req, res) {
    res.status(404).end();
});
