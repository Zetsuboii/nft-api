const express = require('express');
const contractController = require('../controllers/contractController');

const router = express.Router();

router.route('').post(contractController.createContract);
router.route('/:id').get(contractController.getContract);

module.exports = router;
