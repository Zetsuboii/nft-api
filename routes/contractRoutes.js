const express = require('express');
const fs = require('fs');
const utils = require('../utils.js');

const router = express.Router();

const contracts = JSON.parse(fs.readFileSync(utils.dataPathFmt('contracts')));

const createContract = (req, res) => {
  //* Will use "application/json"
  const fields = req.body;
  const fieldsWithId = JSON.stringify(fields) + contracts.length;
  const hashedId = utils.encrypt(fieldsWithId);
  const entry = {
    id: hashedId,
    details: fields,
  };
  contracts.push(entry);
  utils.updateFile(utils.dataPathFmt('contracts'), contracts).then(() => {
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

router.route('').post(createContract);
router.route('/:id').get(getContract);

module.exports = router;
