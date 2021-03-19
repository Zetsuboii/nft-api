const express = require("express");
const formidable = require("formidable");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

app.use(express.json());

const hash = crypto.createHash("sha256");
const encrypt = (i) => {
  hash.update(i);
  return hash.digest("hex");
};

const dataPathFmt = (name) =>
  `${__dirname}/data/${name}.json`;

console.log(dataPathFmt("nft"));
const nfts = JSON.parse(
  fs.readFileSync(dataPathFmt("nft"))
);

const addBufferIndex = (d) =>
  Buffer.concat([d, Buffer.from(nfts.length + "")]);

app.get("/api/v1/nft", (req, res) => {
  res.status(200).json({
    status: "success",
    results: nfts.length,
    data: nfts,
  });
});

app.get("/api/v1/nft/:id", (req, res) => {
  if (req.params.id * 1 < nfts.length) {
    res.status(200).json({
      status: "success",
      results: nfts.length,
      data: nfts[req.params.id],
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
      const hashId = encrypt(data);
      //* Change to Object.assign
      const entry = {
        id: hashId,
        name: fields.name,
        price: fields.price,
        //? Not sure how to handle files in here correctly, since I'll use DB I don't bother
      };
      nfts.push(entry);
      fs.writeFile(
        dataPathFmt("nft"),
        JSON.stringify(nfts),
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log(
            "✔ Contents of the nft.json has been updated"
          );
        }
      );
    });
  });
  res.send("Done");
});

app.listen(PORT, () =>
  console.log(`Example app listening on port ${PORT}!`)
);
