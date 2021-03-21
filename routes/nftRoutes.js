const express = require('express');
const nftController = require('../controllers/nftController');

const router = express.Router();

router.route('/').get(nftController.getAllNfts).post(nftController.addNft);
router
  .route('/:id')
  .get(nftController.getNftOfId)
  .patch(nftController.changeOwner);

module.exports = router;
