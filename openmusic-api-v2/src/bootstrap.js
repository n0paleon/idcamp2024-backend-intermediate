const Jwt = require('@hapi/jwt');

// albums
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsPlugin = require('./api/albums');
const AlbumsValidator = require('./validator/albums');

// songs
const SongsService = require('./services/postgres/SongsService');
const SongsPlugin = require('./api/songs');
const SongsValidator = require('./validator/songs');

// users
const UsersService = require('./services/postgres/UsersService');
const UsersPlugin = require('./api/users');
const UsersValidator = require('./validator/users');

// authentications
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const AuthenticationsPlugin = require('./api/authentications');
const AuthenticationsValidator = require('./validator/authentications');

// playlists
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsPlugin = require('./api/playlists');
const PlaylistsValidator = require('./validator/playlists');

// collaborations
const CollaborationsService = require('./services/postgres/CollaborationsService');
const CollaborationsPlugin = require('./api/collaborations');
const CollaborationsValidator = require('./validator/collaborations');

const TokenManager = require('./tokenize/TokenManager');

module.exports = async (server) => {
  // services bootstrapping
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(songsService, collaborationsService);

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
      plugin: AlbumsPlugin,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: SongsPlugin,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: UsersPlugin,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: AuthenticationsPlugin,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: PlaylistsPlugin,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: CollaborationsPlugin,
      options: {
        collaborationsService,
        playlistsService,
        usersService,
        validator: CollaborationsValidator,
      },
    },
  ]);
};
