const crypto = require("node:crypto");
const jwt = require("jsonwebtoken");
const helpers = require("./helpers");

const ISSUER = "movie-platform-api";
const AUDIENCE = "web-client";
const ALGORITHM = "HS256";
const CLOCK_TOLERANCE_SECONDS = 5;

const TOKEN_TYPE = { ACCESS: "access", REFRESH: "refresh" };

// using helper function to get environment variables values
const accessSecret = () => helpers.getEnv("JWT_SECRET");
const refreshSecret = () => helpers.getEnv("JWT_REFRESH_SECRET");
const accessTtl = () => helpers.getEnv("JWT_EXPIRES_IN");
const refreshTtl = () => helpers.getEnv("JWT_REFRESH_EXPIRES_IN");

function signAccessToken(id, role) {
  if (id === undefined || id === null) {
    throw new TypeError(`signAccessToken: id is required`);
  }
  if (role === undefined || role === null) {
    throw new TypeError(`signAccessToken: role is required`);
  }
  if (typeof role != "string") {
    throw new TypeError(`role must be a string`);
  }

  const payload = {
    sub: String(id),
    role: role.trim(),
    tokenType: TOKEN_TYPE.ACCESS,
  };

  const options = {
    algorithm: ALGORITHM,
    expiresIn: accessTtl(),
    issuer: ISSUER,
    audience: AUDIENCE,
  };
  return jwt.sign(payload, accessSecret(), options);
}

function signRefreshToken(id, jti) {
  if (id === undefined || id === null) {
    throw new TypeError(`signRefreshToken: id is required`);
  }
  if (jti === undefined || jti === null) {
    throw new TypeError(`signRefreshToken: jti is required`);
  }

  const payload = {
    sub: String(id),
    jti: jti,
    tokenType: TOKEN_TYPE.REFRESH,
  };

  const options = {
    algorithm: ALGORITHM,
    expiresIn: refreshTtl(),
    issuer: ISSUER,
    audience: AUDIENCE,
  };

  return jwt.sign(payload, refreshSecret(), options);
}

function verifyToken(token, secret, expectedType) {
  if (typeof token !== "string" || token.trim() === "") {
    throw new jwt.JsonWebTokenError("Token is missing or malformed");
  }

  const decoded = jwt.verify(token, secret, {
    algorithm: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
    clockTolerance: CLOCK_TOLERANCE_SECONDS,
  });

  if (decoded.tokenType != expectedType) {
    throw new jwt.JsonWebTokenError(`Invalid token type`);
  }

  if (typeof decoded.sub !== "string" || decoded.sub.length === 0) {
    throw new jwt.JsonWebTokenError(`Token is missing sub`);
  }

  return decoded;
}

function verifyAccessToken(token) {
  return verifyToken(token, accessSecret(), TOKEN_TYPE.ACCESS);
}

function verifyRefreshToken(refreshToken) {
  const decoded = verifyToken(
    refreshToken,
    refreshSecret(),
    TOKEN_TYPE.REFRESH,
  );
  if (typeof decoded.jti != "string" || decoded.jti.length == 0) {
    throw new jwt.JsonWebTokenError(`Refresh token is missing jti`);
  }
  return decoded;
}

function createJti() {
  return crypto.randomUUID();
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  createJti,
  TOKEN_TYPE,
};
