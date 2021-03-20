const express = require('express');
const formidable = require('formidable');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.json());

const hash = crypto.createHash('sha256');
const encrypt = (i) => {
  hash.update(i);
  return hash.digest('hex');
};

const dataPathFmt = (name) =>
  `${__dirname}/data/${name}.json`;

const nfts = JSON.parse(
  fs.readFileSync(dataPathFmt('nft'))
);

const updateNftsFile = () => {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      dataPathFmt('nft'),
      JSON.stringify(nfts),
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });
};

const addBufferIndex = (d) =>
  Buffer.concat([d, Buffer.from(nfts.length + '')]);

app.get('/api/v1/nft', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: nfts.length,
    data: nfts,
  });
});

// TODO: Get the actual id, not the index
app.get('/api/v1/nft/:id', (req, res) => {
  if (req.params.id * 1 < nfts.length) {
    res.status(200).json({
      status: 'success',
      results: nfts.length,
      data: nfts[req.params.id],
    });
  } else {
    res.status(404).json({
      status: 'fail',
      msg: 'no object found with given id',
    });
  }
});

// TODO: Validate with Joi
app.post('/api/v1/nft', (req, res) => {
  //* Works with "form-data"
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err.message);
      return;
    }
    // TODO: Write Promises
    fs.readFile(files.file.path, (err, filePath) => {
      if (err) {
        console.log(err.message);
        return;
      }
      filePath = addBufferIndex(filePath);
      const hashId = encrypt(filePath);
      const entry = Object.assign({ id: hashId }, fields);
      //? Not sure how to handle files in here correctly, since I'll use DB I won't bother
      nfts.push(entry);
      updateNftsFile()
        .then(() =>
          console.log(
            '✔ Contents of nft.json have been updated'
          )
        )
        .catch((err) => console.log(err));
      res.status(200).json({
        status: 'success',
        data: entry,
      });
    });
  });
});

// TODO: Will get sender's id and new owner
app.patch('/api/v1/nft/:id', (req, res) => {
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
        console.log(
          '❌ No NFT found with id ' + req.params.id
        );
        res.status(404).json({
          status: 'fail',
          msg: 'invalid ID',
        });
      }

      if (fields.address !== nft.owner) {
        res.status(403).json({
          status: 'fail',
          msg:
            "can't change the ownership of the NFT you don't own",
        });
        return;
      }

      nft.owner = fields.owner;
      updateNftsFile()
        .then(() => {
          console.log(
            '✔ Contents of nft.json have been updated'
          );
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
});
app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`)
);
