var inherits = require('./util').inherits;

/**
 * AbstractError
 */
var AbstractError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || 'Error';
};
inherits(AbstractError, Error);
AbstractError.prototype.name = 'Abstract Error';

/**
 * NotImplementedError
 */
var NotImplementedError = function (msg) {
  NotImplementedError.super_.call(this, msg, this.constructor);
}
inherits(NotImplementedError, AbstractError);
NotImplementedError.prototype.message = 'Not Implemented Error';


module.exports = {
  AbstractError: AbstractError,
  NotImplementedError: NotImplementedError
};
