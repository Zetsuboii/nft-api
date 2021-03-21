const express = require('express');

const router = express.Router();

router.route('').post(createContract);
router.route('/:id').get(getContract);

module.exports = router;
