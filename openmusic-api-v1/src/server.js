require('dotenv').config();
const Hapi = require('@hapi/hapi');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const Validator = require('./validator');
const albumsPlugin = require('./api/albums');
const songsPlugin = require('./api/songs');
const ClientError = require('./exceptions/ClientError');

const init = async () => {
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  const albumsService = new AlbumsService();
  const songsService = new SongsService();

  await server.register([
    {
      plugin: albumsPlugin,
      options: {
        service: albumsService,
        validator: Validator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
        validator: Validator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    const payload = {
      status: 'fail',
      message: 'Error',
    };

    const errResponse = h.response(payload);

    if (response instanceof ClientError) {
      payload.message = response.message;
      errResponse.code(response.statusCode);
      return errResponse;
    }

    if (response.isBoom) {
      if (response.output.statusCode === 404) {
        payload.message = 'Resource Not Found';
        errResponse.code(404);
      } else {
        payload.status = 'error';
        payload.message = 'Internal Server Error';
        errResponse.code(500);
      }

      return errResponse;
    }

    return h.continue;
  });

  const shutdownGracefully = async () => {
    try {
      console.log('Shutting down gracefully...');
      await server.stop({ timeout: 10000 });
      console.log('Server stopped gracefully');
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdownGracefully);
  process.on('SIGTERM', shutdownGracefully);

  await server.start();
  console.log(`Server started at ${server.info.uri}`);
};

init();
