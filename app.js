const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(express.json());

const hash = crypto.createHash("sha256");
const decrypt = (i) => {
  hash.update(i);
  return hash.digest("hex");
};

const dataPathFmt = (name) =>
  `${__dirname}/data/${name}.json`;

console.log(dataPathFmt("nft"));
const nft = JSON.parse(fs.readFileSync(dataPathFmt("nft")));

const addBufferIndex = (d) =>
  Buffer.concat([d, Buffer.from(nft.length + "")]);

app.get("/api/v1/nft", (req, res) => {
  res.status(200).json({
    status: "success",
    data: nft,
  });
});

app.get("/api/v1/nft/:id", (req, res) => {
  if (req.params.id * 1 < nft.length) {
    res.status(200).json({
      status: "success",
      results: nft.length,
      data: nft[id],
    });
  } else {
    res.status(404).json({
      status: "fail",
      msg: "no object found with given id",
    });
  }
});

app.post("/api/v1/nft", (req, res) => {
  const form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err.message);
      return;
    }

    //* Turned out unnecessary, change to .readFileSync()
    const readStr = fs.createReadStream(files.file.path);
    readStr.on("data", (data) => {
      data = addBufferIndex(data);
      console.log(decrypt(data));
    });
  });
  res.send("Done");
});

app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`)
);
