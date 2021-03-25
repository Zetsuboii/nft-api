const fs = require('fs');
const utils = require('../utils');

const Contract = require('../models/contract/contractModel');
const contracts = JSON.parse(fs.readFileSync(utils.dataPathFmt('contracts')));

exports.createContract = async (req, res) => {
  //* Will use "application/json"
  const fields = req.body;
  const contractLength = (await Contract.find()).length;
  const fieldsWithId = JSON.stringify(fields) + contractLength;
  const hashedId = utils.encrypt(fieldsWithId);
  const entry = {
    hashedId: hashedId,
    createdTime: new Date(),
    name: fields.name,
    owner: fields.owner,
  };
  Contract.create(entry)
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
};

exports.getContract = (req, res) => {
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
