const InvariantError = require('../../exceptions/InvariantError');
const { UserSchema } = require('./schema');

const UsersValidator = {
  validateUserPayload: (payload) => {
    const validationResult = UserSchema.validate(payload);

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = UsersValidator;
