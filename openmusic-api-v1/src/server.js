require('dotenv').config();
const Hapi = require('@hapi/hapi');

const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const SchemaValidator = require('./validator');
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
        validator: SchemaValidator,
      },
    },
    {
      plugin: songsPlugin,
      options: {
        service: songsService,
        validator: SchemaValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    let responseObject;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        responseObject = h.response({
          status: 'fail',
          message: response.message,
        }).code(response.statusCode);
      } else if (!response.isServer) {
        return h.continue;
      } else {
        responseObject = h.response({
          status: 'error',
          message: 'Internal Server Error',
        }).code(500);
      }
    } else {
      responseObject = h.response(response);
    }

    responseObject.header('X-Developed-By', 'Muhammad Naufal Al Fattah');

    return responseObject;
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
