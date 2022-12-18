class PrefixedLogger {
  constructor(prefix, logger) {
    this.prefix = prefix || "";
    this.logger = logger;
  }

  log() {
    return this.logger.log.apply(this.logger, [this.prefix, ...arguments]);
  }

  info() {
    return this.logger.info.apply(this.logger, [this.prefix, ...arguments]);
  }

  warn() {
    return this.logger.warn.apply(this.logger, [this.prefix, ...arguments]);
  }

  error() {
    return this.logger.error.apply(this.logger, [this.prefix, ...arguments]);
  }

  debug() {
    return this.logger.debug.apply(this.logger, [this.prefix, ...arguments]);
  }
}
