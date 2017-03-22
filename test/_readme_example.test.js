var test   = require('tape');
var JWT    = require('jsonwebtoken');
var secret = process.env.JWT_SECRET;

// this is the **Exact** Code from in the Readme
var server = require('../example/basic_server');

test("No token required for root route.", function(t) {
  var options = {
    method: "GET",
    url: "/"
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "No Token required for root route.");
    t.end();
  });
});

test("Auth should pass with valid id & token", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 1, "name": "Jen Jones" }, secret);
  var options = {
    method: "GET",
    url: "/restricted",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 200, "Valid token should succeed!");
    t.end();
  });
});

test("Auth should fail with invalid", function(t) {
  // use the token as the 'authorization' header in requests
  var token = JWT.sign({ id: 0, "name": "Johnny Nogood" }, secret);
  var options = {
    method: "GET",
    url: "/restricted",
    headers: { authorization: "Bearer " + token }
  };
  // server.inject lets us simulate an http request
  server.inject(options, function(response) {
    t.equal(response.statusCode, 401, "Invalid (user) id should 401!");
    t.end();
  });
});

test.onFinish(function () {
  server.stop(function(){});
})
