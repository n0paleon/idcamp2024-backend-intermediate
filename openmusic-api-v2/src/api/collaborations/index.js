const routes = require('./routes');
const CollaborationsHandler = require('./handler');

module.exports = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, {
    collaborationsService, playlistsService, usersService, validator,
  }) => {
    // eslint-disable-next-line max-len
    const handler = new CollaborationsHandler(collaborationsService, playlistsService, usersService, validator);
    server.route(routes(handler));
  },
};
