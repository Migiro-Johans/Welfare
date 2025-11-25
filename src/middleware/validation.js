const Joi = require('joi');

const registrationSchema = Joi.object({
  member_id: Joi.string().alphanum().min(3).max(50).optional().allow('', null),
  email: Joi.string().email().required(),
  full_name: Joi.string().min(2).max(255).required(),
  phone: Joi.string().pattern(/^\+254[0-9]{9}$/).required().messages({
    'string.pattern.base': 'Phone number must be in format +254XXXXXXXXX'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().required().messages({
    'string.empty': 'Email or phone number is required'
  }),
  password: Joi.string().required()
});

const voteSchema = Joi.object({
  vote_option: Joi.number().valid(1, 2).required()
});

const pollSettingsSchema = Joi.object({
  is_open: Joi.boolean(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso().greater(Joi.ref('start_date')),
  minimum_votes_option2: Joi.number().integer().min(1),
  poll_title: Joi.string().max(500),
  poll_description: Joi.string(),
  total_expected_members: Joi.number().integer().min(1).max(10000)
});

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req.validatedData = value;
    next();
  };
};

module.exports = {
  validateRequest,
  registrationSchema,
  loginSchema,
  voteSchema,
  pollSettingsSchema
};
