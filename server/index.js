const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});

// Create table if it doesn't exist
pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.log(err));
});

// Redis Client Setup
const redis = rquire("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Exress route handlers

// Set up a get route to test the server
app.get("/", (req, res) => {
  res.send("Hi");
});

// Set up a get route to get all the values from the postgres table
app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SSELECT * from values");

  res.send(values.rows);
});

// Set up a get route to get the current values from the redis hash
app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

// Set up a post route to add a new index to the redis hash
app.post("values", async (req, res) => {
  const { index } = req.body;

  // Limit the index to 40
  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  // Add the index to the redis hash
  redisClient.hset("values", index, "Nothing yet!");
  // Publish the index to the redis server
  redisPublisher.publish("insert", index);
  // Add the index to the postgres table
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]);

  res.send({ working: true });
});

// Listen on port 5000
app.listen(5000, (err) => {
  console.log("Listening...");
});
