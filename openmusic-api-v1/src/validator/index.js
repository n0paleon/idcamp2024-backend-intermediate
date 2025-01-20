const ClientError = require('../exceptions/ClientError');
const { AlbumSchema } = require('./schema');

const Validator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumSchema.validate(payload);

    if (validationResult.error) {
      throw new ClientError(validationResult.error.message);
    }
  },
};

module.exports = Validator;
