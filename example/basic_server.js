// this example is mirrored directly from the readme
// and tested in /test/_readme_example.test.js
var Hapi = require('hapi');
var Hoek = require('hoek'); // see: github.com/dwyl/hapi-error#explanation
var people = { // our "users database"
    1: {
      id: 1,
      name: 'Jen Jones'
    }
};

// bring your own validation function
var validate = function (decoded, request, callback) {
    // do your checks to see if the person is valid
    if (!people[decoded.id]) {
      return callback(null, false);
    }
    else {
      return callback(null, true);
    }
};

var server = new Hapi.Server();
server.connection({ port: 8000 });
  // include our module here ↓↓
server.register(require('../lib'), function (err) {
    // for friendly error handling see: github.com/dwyl/hapi-error
    Hoek.assert(!err, 'Error registering hapi-auth-jwt2 plugin');

    server.auth.strategy('jwt', 'jwt',
    { key: process.env.JWT_SECRET, // Never Share your secret key
      validateFunc: validate       // validate function defined above
    });

    server.auth.default('jwt');

    server.route([
      {
        method: "GET", path: "/", config: { auth: false },
        handler: function(request, reply) {
          reply({text: 'Token not required'});
        }
      },
      {
        method: 'GET', path: '/restricted', config: { auth: 'jwt' },
        handler: function(request, reply) {
          reply({text: 'You used a Token!'})
          .header("Authorization", request.headers.authorization);
        }
      }
    ]);
});

server.start(function () {
  console.log('Server running at:', server.info.uri);
});

module.exports = server;
