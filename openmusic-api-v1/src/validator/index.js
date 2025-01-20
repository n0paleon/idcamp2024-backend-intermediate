const InvariantError = require('../exceptions/InvariantError');
const { AlbumSchema, SongSchema } = require('./schema');

const Validator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlbumSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
  validateSongPayload: (payload) => {
    const validationResult = SongSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = Validator;
