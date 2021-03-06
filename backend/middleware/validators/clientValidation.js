const { body, param } = require('express-validator');

const clientSchema = [
  body('clientName').exists({ checkFalsy: true }).isString().withMessage('Client must be a string').trim(),
  body('color').optional({ checkFalsy: true }).isString().isHexColor().withMessage('color must be entered as a Hex value'),
  body('contact').optional({ checkFalsy: true }).isObject().withMessage('Contact must be an object'),
  body('contact.email').optional({ checkFalsy: true }).trim().normalizeEmail().isEmail().withMessage('Must enter a valid email'),
  body('contact.name').optional({ checkFalsy: true }).isString().withMessage('Contact name must be valid').trim(),
];

const clientParams = [param('id').exists({ checkFalsy: true }).isMongoId().withMessage('Invalid client')];

module.exports = { clientSchema, clientParams };
