const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');
const morgan = require('morgan');

const app = express();
const PORT = 3000;

app.use(morgan('dev'));
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
const contracts = JSON.parse(fs.readFileSync(dataPathFmt('contracts')));

const updateFile = (path, list) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dataPathFmt(path), JSON.stringify(list), (err) => {
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
      filePath = addBufferIndex(filePath);
      const hashId = encrypt(filePath);
      const entry = Object.assign(
        { id: hashId, createdTime: req.requestTime },
        fields
      );
      //? Not sure how to handle files in here correctly, since I'll use DB I won't bother
      nfts.push(entry);
      updateFile('nft', nfts)
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
  updateFile('nft', nfts)
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

const createContract = (req, res) => {
  //* Will use "application/json"
  const fields = req.body;
  const fieldsWithId = JSON.stringify(fields) + contracts.length;
  const hashedId = encrypt(fieldsWithId);
  const entry = {
    id: hashedId,
    details: fields,
  };
  contracts.push(entry);
  updateFile('contracts', contracts).then(() => {
    console.log('✔ Contents of nft.json have been updated');
    res
      .status(200)
      .json({
        status: 'success',
        data: entry,
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          status: 'fail',
          msg: 'internal server error',
        });
      });
  });
};

const getContract = (req, res) => {
  //* 64 characters long id isn't necessarily expected, a matching one is enough
  //* The app should decide how long of a query it will send, 8 seems enough

  //? That's a one way to do it but I want the first characters to match
  /* const matches = contracts.filter((contract) =>
    contract.id.includes(req.params.id, 0)
  ); */
  const matches = contracts.filter(
    (contract) => contract.id.slice(0, req.params.id.length) === req.params.id
  );
  if (matches.length === 0) {
    res.status(404).json({
      status: 'fail',
      msg: "couldn't find any contract with given ID",
    });
    return;
  }
  res.status(200).json({
    status: 'success',
    results: matches.length,
    matches: matches,
  });
};

const nftRouter = express.Router();
const contractRouter = express.Router();

nftRouter.route('/').get(getAllNfts).post(addNft);
nftRouter.route('/:id').get(getNftOfId).patch(changeOwner);

contractRouter.route('').post(createContract);
contractRouter.route('/:id').get(getContract);

app.use('/api/v1/nft', nftRouter);
app.use('/api/v1/contract', contractRouter);

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));
