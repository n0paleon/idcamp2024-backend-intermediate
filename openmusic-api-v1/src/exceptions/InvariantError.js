const ClientError = require('./ClientError');

class InvariantError extends ClientError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;
