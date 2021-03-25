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
  const matchNft = await Nft.findOne({
    hashedId: req.params.id,
  });
  //? This is an another way to do it
  // const matchNft = await Nft.find().where('hashedId').equals(req.params.id);

  if (matchNft.length === 0) {
    res.status(404).json({
      status: 'fail',
      msg: 'invalid ID',
    });
    return;
  }
  res.status(200).json({
    status: 'success',
    data: { ...matchNft, file: '[File Object]' },
  });
};

exports.addNft = async (req, res) => {
  //* Works with "form-data"
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err.message);
      return;
    }
    fs.readFile(files.file.path, async (readErr, file) => {
      if (readErr) {
        console.error(readErr.message);
        return;
      }
      const nftsLength = (await Nft.find()).length;
      const fileWithIndex = utils.addBufferIndex(file, nftsLength);
      const hashedId = utils.encrypt(fileWithIndex);

      fs.writeFile(`${__dirname}/../data/${hashedId}.jpg`, file, (err) => {
        if (err) {
          console.error(err.message);
          return;
        }
        console.log(
          `✔ Contents of the file has been written to ${hashedId}.jpg`
        );
      });

      const entry = {
        hashedId: hashedId,
        createdTime: new Date(),
        name: fields.name,
        price: fields.price,
        owner: fields.owner,
        file: file,
      };

      Nft.create(entry)
        .then(() => {
          res.status(200).json({
            status: 'success',
            data: { ...entry, file: '[File Object]' },
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
      res.status(200).json({
        status: 'success',
        data: nftMatch,
      });
    }
    throw 'no NFT found';
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      msg: err.message,
    });
  }
};
