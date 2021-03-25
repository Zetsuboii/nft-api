const fs = require('fs');
const crypto = require('crypto');

exports.encrypt = (i) => {
  const hash = crypto.createHash('sha256');
  hash.update(i);
  return hash.digest('hex');
};

exports.dataPathFmt = (name) => `${__dirname}/data/${name}.json`;

exports.addBufferIndex = (data, listLength) =>
  Buffer.concat([data, Buffer.from(`${listLength}`)]);

exports.updateFile = (path, list) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path, JSON.stringify(list), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
