import * as Joi from 'joi';

export const envConfig = Joi.object({
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
});
