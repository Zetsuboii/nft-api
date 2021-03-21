const express = require('express');
const fs = require('fs');
const utils = require('../utils.js');
const formidable = require('formidable');

const router = express.Router();

const nfts = JSON.parse(fs.readFileSync(utils.dataPathFmt('nft')));

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
  //* Works with "application/form-data"
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
      filePath = utils.addBufferIndex(filePath, nfts);
      const hashId = utils.encrypt(filePath);
      const entry = Object.assign(
        { id: hashId, createdTime: req.requestTime },
        fields
      );
      //? Not sure how to handle files in here correctly, since I'll use DB I won't bother
      nfts.push(entry);
      utils
        .updateFile(utils.dataPathFmt('nft'), nfts)
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
  //* Works with "application/json"
  fields = req.body;
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
  utils
    .updateFile(utils.dataPathFmt('nft'), nfts)
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
      console.log(err);
      res.status(500).json({
        status: 'fail',
        msg: 'internal server error',
      });
    });
};

router.route('/').get(getAllNfts).post(addNft);
router.route('/:id').get(getNftOfId).patch(changeOwner);

module.exports = router;
