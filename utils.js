const fs = require('fs');
const crypto = require('crypto');

exports.encrypt = (i) => {
  const hash = crypto.createHash('sha256');
  hash.update(i);
  return hash.digest('hex');
};

exports.addBufferIndex = (data, listLength) =>
  Buffer.concat([data, Buffer.from(`${listLength}`)]);
