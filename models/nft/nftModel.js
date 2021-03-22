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
    type: String,
    required: [true, nftMissing('price')],
  },
  owner: {
    type: String,
    required: [true, nftMissing('owner')],
  },
  file: {
    type: Buffer,
    required: [true, nftMissing('file')],
  },
});

const Nft = mongoose.model('Nft', nftSchema);

module.exports = Nft;
