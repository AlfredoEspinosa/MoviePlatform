const cryptjs = require("bcryptjs");

const bcrypt_rounds = Number.parseInt(process.env.BCRYPT_ROUNDS) | 12;

function hashPassword(plainPassword) {
  if (typeof plainPassword !== "string") {
    throw new TypeError(`${plainPassword} must be of type string`);
  }

  if (!plainPassword) {
    throw new Error(`password is required`);
  }

  if (plainPassword.trim().length == 0) {
    throw new Error(`Password can't be empty`);
  }

  return cryptjs.hash(plainPassword, bcrypt_rounds);
}

function verifyPassword(plainPassword, hash) {
  if (
    plainPassword == null ||
    plainPassword == undefined ||
    typeof plainPassword !== "string" ||
    plainPassword.trim().length == 0
  ) {
    throw new Error(`Password can't be null or empty and must be type string`);
  }

  return cryptjs.compare(plainPassword, hash);
}

module.exports = { hashPassword, verifyPassword };
