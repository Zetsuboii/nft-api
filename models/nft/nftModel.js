const mongoose = require('mongoose');

const nftMissing = (field) => `NFT is missing ${field} field`;

const nftSchema = new mongoose.Schema({
  hashedId: {
    type: String,
    required: [true, nftMissing('hashedId')],
    unique: true,
  },
  createdTime: {
    type: Date,
    required: [true, nftMissing('createdTime')],
  },
  name: {
    type: String,
    required: [true, nftMissing('name')],
  },
  price: {
    type: Number,
    required: [true, nftMissing('price')],
  },
  owner: {
    type: String,
    required: [true, nftMissing('owner')],
  },
});

const Nft = mongoose.model('Nft', nftSchema);

module.exports = Nft;
