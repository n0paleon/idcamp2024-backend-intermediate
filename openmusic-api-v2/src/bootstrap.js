const Jwt = require('@hapi/jwt');

// albums
const AlbumsService = require('./services/postgres/AlbumsService');
const albumsPlugin = require('./api/albums');
const AlbumsValidator = require('./validator/albums');

// songs
const SongsService = require('./services/postgres/SongsService');
const songsPlugin = require('./api/songs');
const SongsValidator = require('./validator/songs');

// users
const UsersService = require('./services/postgres/UsersService');
const usersPlugin = require('./api/users');
const UsersValidator = require('./validator/users');

// authentications
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const authenticationsPlugin = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');

const TokenManager = require('./tokenize/TokenManager');

module.exports = async (server) => {
  // services bootstrapping
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();

  await server.register([{ plugin: Jwt }]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: artifacts.decoded.payload.userId,
      },
    }),
  });

  await server.register([
    {
      plugin: albumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: usersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
  ]);
};
