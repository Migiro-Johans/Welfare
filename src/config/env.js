const Joi = require('joi');
const logger = require('../utils/logger');

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  
  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  
  // JWT
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  
  // Email
  EMAIL_SERVICE: Joi.string().default('gmail'),
  EMAIL_USER: Joi.string().email().required(),
  EMAIL_PASS: Joi.string().required(),
  EMAIL_FROM: Joi.string().email().required(),
  
  // Client
  CORS_ORIGIN: Joi.string().uri().default('http://localhost:3000'),
  
  // Admin
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_INITIAL_PASSWORD: Joi.string().min(8).required()
}).unknown();

const validateEnv = () => {
  const { error, value } = envSchema.validate(process.env, { abortEarly: false });

  if (error) {
    logger.error('Environment validation failed:');
    error.details.forEach(detail => {
      logger.error(`- ${detail.message}`);
    });
    process.exit(1);
  }

  return value;
};

module.exports = validateEnv;
