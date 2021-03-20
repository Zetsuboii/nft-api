const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

const hash = crypto.createHash('sha256');
const encrypt = (i) => {
  hash.update(i);
  return hash.digest('hex');
};

const dataPathFmt = (name) => `${__dirname}/data/${name}.json`;

const nfts = JSON.parse(fs.readFileSync(dataPathFmt('nft')));

const updateNftsFile = () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataPathFmt('nft'), JSON.stringify(nfts), (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};

const addBufferIndex = (d) => Buffer.concat([d, Buffer.from(nfts.length + '')]);

const getAllNfts = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    results: nfts.length,
    data: nfts,
  });
};

const getNftOfId = (req, res) => {
  const nft = nfts.find((n) => n.id === req.params.id);
  if (nft === undefined) {
    console.log('❌ No NFT found with id ' + req.params.id);
    res.status(404).json({
      status: 'fail',
      msg: 'invalid ID',
    });
    return;
  }
  res.status(200).json({
    status: 'success',
    data: nft,
  });
};

// TODO: Validate with Joi
const addNft = (req, res) => {
  //* Works with "form-data"
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err.message);
      return;
    }
    fs.readFile(files.file.path, (err, filePath) => {
      if (err) {
        console.log(err.message);
        return;
      }
      filePath = addBufferIndex(filePath);
      const hashId = encrypt(filePath);
      const entry = Object.assign(
        { id: hashId, createdTime: req.requestTime },
        fields
      );
      //? Not sure how to handle files in here correctly, since I'll use DB I won't bother
      nfts.push(entry);
      updateNftsFile()
        .then(() => {
          console.log('✔ Contents of nft.json have been updated');
          res.status(200).json({
            status: 'success',
            data: entry,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).json({
            status: 'fail',
            msg: 'internal server error',
          });
        });
    });
  });
};

const changeOwner = (req, res) => {
  //* Works with "x-www-form-encoded"
  const form = new formidable.IncomingForm();
  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error(err);
        throw err;
      }
      const nft = nfts.find((n) => n.id === req.params.id);
      if (nft === undefined) {
        console.log('❌ No NFT found with id ' + req.params.id);
        res.status(404).json({
          status: 'fail',
          msg: 'invalid ID',
        });
      }

      if (fields.address !== nft.owner) {
        res.status(403).json({
          status: 'fail',
          msg: "can't change the ownership of the NFT you don't own",
        });
        return;
      }

      nft.owner = fields.owner;
      console.log(nfts.find((n) => n.id === req.params.id).owner);
      updateNftsFile()
        .then(() => {
          console.log('✔ Contents of nft.json have been updated');
          res.status(200).json({
            status: 'success',
            data: {
              nft: nft,
            },
          });
          return;
        })
        .catch((err) => {
          throw err;
        });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      status: 'fail',
      msg: 'internal server error',
    });
  }
};

app.route('/api/v1/nft').get(getAllNfts).post(addNft);
app.route('/api/v1/nft/:id').get(getNftOfId).patch(changeOwner);

//? So far I don't feel like I should have a delete method

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
