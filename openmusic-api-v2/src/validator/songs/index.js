const InvariantError = require('../../exceptions/InvariantError');
const { SongSchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const validationResult = SongSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = SongsValidator;
