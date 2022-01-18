const jwt = require('express-jwt');
const jwksRsa = require('jwks-rsa');
const jwtAuthz = require('express-jwt-authz');

const { domain, audience } = require('../config/env');

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${domain}/.well-known/jwks.json`,
  }),

  audience: audience,
  issuer: `https://${domain}/`,
  algorithms: ['RS256'],
});

const options = { customScopeKey: 'permissions', failWithError: true };

const readClients = jwtAuthz(['read:clients'], options);
const createClients = jwtAuthz(['create:clients'], options);

module.exports = { checkJwt, readClients, createClients };
