const path = require("path");
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const Datastore = require("nedb");
let items = new Datastore({
  filename: path.join(__dirname, "db", "items.db"),
  autoload: true,
  // timestamp each record
  timestampData: true,
});

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.get("/api/items/", function (req, res, next) {
  items
    // find everything without filter
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .exec(function (err, items) {
      if (err) return res.status(500).end(err);
      return res.json(items.reverse());
    });
});

app.post("/api/items/", function (req, res, next) {
  items.insert({ content: req.body.content }, function (err, item) {
    if (err) return res.status(500).end(err);
    return res.json(item);
  });
});

app.get("/api/items/:id/", function (req, res, next) {
  // filter by id
  items.findOne({ _id: req.params.id }, function (err, item) {
    if (err) return res.status(500).end(err);
    if (!item) {
      return res
        .status(404)
        .end("Item id #" + req.params.id + " does not exists");
    }
    return res.json(item);
  });
});

app.delete("/api/items/:id/", function (req, res, next) {
  items.findOne({ _id: req.params.id }, function (err, item) {
    if (err) return res.status(500).end(err);
    if (!item) {
      return res
        .status(404)
        // in your work, this should be returning sensible JSON messages
        .end("Item id #" + req.params.id + " does not exist");
    }
    items.remove({ _id: item._id }, { multi: false }, function (err, num) {
      res.json(item);
    });
  });
});

app.use(express.static("static"));

const http = require("http");
const PORT = 3000;

http.createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});
