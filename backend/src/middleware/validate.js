/**
 * validate.js — express-validator helper
 * Call validate(rules) as middleware to sanitize + check inputs.
 * Returns 422 with field errors if validation fails.
 */
import { validationResult } from 'express-validator';

export function validate(rules) {
  return async (req, res, next) => {
    // Run all rules
    await Promise.all(rules.map((rule) => rule.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  };
}
