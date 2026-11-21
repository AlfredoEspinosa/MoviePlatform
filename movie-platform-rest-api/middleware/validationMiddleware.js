const { body, validationResult } = require("express-validator");

function validateGenere(genere, valid_genres) {
  return valid_genres
    .map((genere) => genere.toLowerCase())
    .includes(genere.toLowerCase());
}

// validates data for movie objects
const validateMovieRecord = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("release_year")
    .notEmpty()
    .withMessage("Release Year is required")
    .bail()
    .isInt({ min: 1 })
    .withMessage("Release Year must be a valid year")
    .bail()
    .custom((year) => Number(year) <= new Date().getFullYear())
    .withMessage("Release year cannot be greater than current year"),
  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),
  body("views")
    .notEmpty()
    .withMessage("Views is required"),
  body("genre")
    .trim()
    .notEmpty()
    .withMessage("Genere is required")
    .bail()
    .custom((genre) => validateGenere(genre, [
    "Drama",
    "Action",
    "Comedy",
    "Fantasy",
    "Romance",
    "Horror",
    "Western",
    "Science fiction",
    "Adventure",
    "Documentary",
    "Animation",
  ]))
    .withMessage("Invalid genre, please choose one of the following list [\"Drama\",\"Action\",\"Comedy\",\"Fantasy\",\"Romance\",\"Horror\",\"Western\",\"Science fiction\",\"Adventure\",\"Documentary\",\"Animation\"]"),
  body("directed_by")
    .trim()
    .notEmpty()
    .withMessage("Directed By is required"),
  body("main_actors")
    .custom((actors) => Array.isArray(actors) ? actors.length > 0 : Boolean(actors && String(actors).trim()))
    .withMessage("Main Actors/Acreesses is required"),
  body("synopsis")
    .trim()
    .notEmpty()
    .withMessage("Synopsis is required"),
  handleValidationErrors,
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
}

/*
 Validate username policy
 - Only aplhanumerics
 - at least 5 characters
*/
const validateUserNamePolicy = [
  body("userName")
    .trim()
    .notEmpty()
    .withMessage(`UserName is required`)
    .isAlphanumeric()
    .withMessage(`Username must contain only letters and nmumbers`)
    .isLength({ min: 5 })
    .withMessage(`Username must be at least 5 characters`),
  handleValidationErrors,
];

// validate password policy
// - at least one special character
// - at least one capital letter
const validatePasswordPolicy = [
  body("password")
    .notEmpty()
    .withMessage(`Password is required`)
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage(
      `Password must contain at least one of these special character [!@#$%^&*().,?"_{}|<>]`,
    )
    .matches(/[A-Z]/)
    .withMessage(`Password must contain at least one capital letter`),
  handleValidationErrors,
];

// validate email
// -using express-validator for email confirmation
const validateEmail = [
  body(`email`)
    .trim()
    .notEmpty()
    .withMessage(`Email is required`)
    .normalizeEmail()
    .isEmail()
    .withMessage(`Invalid email format`),
  handleValidationErrors,
];

// validate that password and passwordConfirmation matches
const validatePasswordConfirmation = [
  body(`passwordConfirmation`)
    .trim()
    .notEmpty()
    .withMessage(`Password confirmation is required`)
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage(`Missmatch in password and confirmation`),
  handleValidationErrors,
];

// Generic vlidator to check that all required fields exists in req.body
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: `The request do not contain a body`,
      });
    }

    const missingFields = requiredFields.filter(
      (field) =>
        req.body[`${field}`] === undefined ||
        req.body[`${field}`] === null ||
        (typeof req.body[`${field}`] === "string" &&
          req.body[`${field}`].trim().length === 0),
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields [${missingFields.join(", ")}]`,
      });
    }
    next();
  };
};

module.exports = {
  validateRequiredFields,
  validateMovieRecord,
  validateUserNamePolicy,
  validateEmail,
  validatePasswordPolicy,
  validatePasswordConfirmation,
};
