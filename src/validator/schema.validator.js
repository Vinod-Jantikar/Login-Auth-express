const validator = (schema) => (payload) =>
    schema.validate(payload, { abortEarly: true });

module.exports = validator;
