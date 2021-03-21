const fs = require('fs');
const crypto = require('crypto');

const hash = crypto.createHash('sha256');

exports = {};

exports.encrypt = (i) => {
  hash.update(i);
  return hash.digest('hex');
};

exports.dataPathFmt = (name) => `${__dirname}/data/${name}.json`;

exports.addBufferIndex = (data, list) =>
  Buffer.concat([data, Buffer.from(list.length + '')]);

exports.updateFile = (path, list) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(list), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

module.exports = exports;
