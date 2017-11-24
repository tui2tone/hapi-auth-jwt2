var Hapi        = require('hapi');
var hapiAuthJWT = require('../lib/');
var JWT         = require('jsonwebtoken');  // used to sign our content
var port        = process.env.PORT || 8000; // allow port to be set

var secret = 'NeverShareYourSecret'; // Never Share This! even in private GitHub repos!

var people = {
    1: {
      id: 1,
      name: 'Anthony Valid User'
    }
};

// use the token as the 'authorization' header in requests
var token = JWT.sign(people[1], secret); // synchronous
console.log(token);
// bring your own validation function
var validate = function (decoded, request, callback) {
  console.log(" - - - - - - - decoded token:");
  console.log(decoded);
  console.log(" - - - - - - - request info:");
  console.log(request.info);
  console.log(" - - - - - - - user agent:");
  console.log(request.headers['user-agent']);

  // do your checks to see if the person is valid
  if (!people[decoded.id]) {
    return callback(null, false);
  }
  else {
    return callback(null, true);
  }
};

var server = new Hapi.Server({ port: port });

const start = async () => {
  try {
    await server.register([ hapiAuthJWT ])

    server.auth.strategy('jwt', 'jwt',
    { 
      key: secret, 
      validateFunc: validate,
      verifyOptions: { ignoreExpiration: true }
    });
  
    server.auth.default('jwt');
  
    server.route([
      {
        method: "GET", path: "/", config: { auth: false },
        handler: (request, response) => {
          return {
            text: 'Token not required'
          }
        }
      },
      {
        method: 'GET', path: '/restricted', config: { auth: 'jwt' },
        handler: (request, h) => {
          
          return h.response({
            message: 'You used a Valid JWT Token to access /restricted endpoint!'
          }).header("Authorization", request.headers.authorization)
        }
      }
    ]);

    await server.start()
  } catch(error) {
    console.log(err);
  }
}

start();
