const fs = require('fs');
const formidable = require('formidable');

const Nft = require('../models/nft/nftModel');
const utils = require('../utils');

exports.getAllNfts = async (req, res) => {
  const results = await Nft.find();
  res.status(200).json({
    status: 'success',
    results: results.length,
    data: results,
  });
};

exports.getNftOfId = async (req, res) => {
  console.log(req.params.id);
  const matchNft = await Nft.find({
    hashedId: req.params.id,
  });
  console.log(typeof matchNft);
  console.log(matchNft.length);
  // const matchNft = await Nft.find().where('hashedId').equals(req.params.id);

  if (matchNft.length === 0) {
    console.log(`❌ No NFT found with id ${req.params.id}`);
    res.status(404).json({
      status: 'fail',
      msg: 'invalid ID',
    });
    return;
  }
  res.status(200).json({
    status: 'success',
    data: matchNft,
  });
};

exports.addNft = async (req, res) => {
  //* Works with "form-data"
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err.message);
      return;
    }
    fs.readFile(files.file.path, (readErr, file) => {
      if (readErr) {
        console.error(readErr);
        return;
      }
      const nftsLength = Nft.find().length;
      const fileWithIndex = utils.addBufferIndex(file, nftsLength);
      const hashedId = utils.encrypt(fileWithIndex);

      const entry = {
        hashedId: hashedId,
        createdTime: new Date(),
        name: fields.name,
        price: fields.price,
        owner: fields.owner,
        file: file,
      };

      const newNft = Nft.create(entry)
        .then(() => {
          res.status(200).json({
            status: 'success',
            data: entry,
          });
        })
        .catch((createErr) => {
          res.status(500).json({
            status: 'fail',
            msg: createErr,
          });
        });
    });
  });
};

exports.changeOwner = async (req, res) => {
  //* Works with "application/json"
  try {
    console.log(req.params.id);
    const nftMatch = await Nft.findOne({
      hashedId: req.params.id,
    });
    console.log(nftMatch);
    console.log(nftMatch.owner);
    console.log(req.body.owner);
    if (nftMatch.owner === req.body.address) {
      nftMatch.owner = req.body.owner;
      nftMatch.save();
      /* const newNft = Nft.findOneAndUpdate(
        { hashedId: req.params.id },
        { owner: req.body.newOwner },
        { new: true }
      ); */
      res.status(200).json({
        status: 'success',
        data: nftMatch,
      });
    }
    throw "Couldn't find nft";
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      msg: err.message,
    });
  }
  //const fields = req.body;
  //const nft = nfts.find((n) => n.id === req.params.id);

  /* if (nft === undefined) {
    console.log(`❌ No NFT found with id ${req.params.id}`);
    res.status(404).json({
      status: 'fail',
      msg: 'invalid ID',
    });
  } */

  /* if (fields.address !== nft.owner) {
    res.status(403).json({
      status: 'fail',
      msg: "can't change the ownership of the NFT you don't own",
    });
    return;
  } */

  /* nft.owner = fields.owner;
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
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 'fail',
        msg: 'internal server error',
      });
    }); */
};
