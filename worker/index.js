const keys = require("./keys");
const redis = require("redis");

// Create a redis client
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_stratedy: () => 1000,
});
// Create a redis subscriber
const sub = redisClient.duplicate();

// Fibonacci function
function fib(index) {
  // Check if index is smaller than 2 and return 1 if so
  if (index < 2) return 1;
  // Call the function recursively and return the sum of the index minus 1 and index minus 2
  return fib(index - 1) + fib(index - 2);
}

// Subscribe to redis and listen for new values
sub.on("message", (channel, message) => {
  redisClient.hset("values", message, fib(parseInt(message)));
});
