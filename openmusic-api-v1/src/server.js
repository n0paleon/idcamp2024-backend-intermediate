require('dotenv').config();
const Hapi = require('@hapi/hapi');

const AlbumsService = require('./services/postgres/AlbumsService');
const Validator = require('./validator');
const albums = require('./api/albums');
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

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
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

    if (response.isBoom && response.output.statusCode === 404) {
      payload.message = 'Resource Not Found';
      errResponse.code(404);
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
