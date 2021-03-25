const mongoose = require('mongoose');

const contractMissing = (field) => `Contract is missing ${field} field`;

const contractSchema = new mongoose.Schema({
  hashedId: {
    type: String,
    required: [true, contractMissing('hashedId')],
    unique: true,
  },
  createdTime: {
    type: Date,
    required: [true, contractMissing('createdTime')],
  },
  name: {
    type: String,
    required: [true, contractMissing('name')],
  },
  owner: {
    type: String,
    required: [true, contractMissing('owner')],
  },
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
