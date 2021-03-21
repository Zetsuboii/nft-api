const express = require('express');

const router = express.Router();

router.route('/').get(getAllNfts).post(addNft);
router.route('/:id').get(getNftOfId).patch(changeOwner);

module.exports = router;
