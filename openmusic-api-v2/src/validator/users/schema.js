const Joi = require('joi');

const UserSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  fullname: Joi.string().required(),
});

module.exports = {
  UserSchema,
};
