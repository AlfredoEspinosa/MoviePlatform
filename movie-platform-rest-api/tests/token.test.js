require("dotenv").config({
  path: "tests/.env.test",
});
const token = require("../utils/token");
const jwt = require("jsonwebtoken");
const helpers = require("../utils/helpers");

// using helper function to get environment variables values
const accessSecret = () => helpers.getEnv("JWT_SECRET");
const invalidAccessSecret = () => helpers.getEnv("JWT_INVALID_SECRET");
const refreshSecret = () => helpers.getEnv("JWT_REFRESH_SECRET");
const invalidRefreshSecret = () => helpers.getEnv("JWT_INVALID_REFRESH_SECRET");
const accessTtl = () => helpers.getEnv("JWT_EXPIRES_IN");
const refreshTtl = () => helpers.getEnv("JWT_REFRESH_EXPIRES_IN");
const algorithm = () => helpers.getEnv("ALGORITHM");
const expiresIn = () => helpers.getEnv("expiresIn");
const issuer = () => helpers.getEnv("ISSUER");
const audience = () => helpers.getEnv("AUDIENCE");

test("Create an access Token with user ID and role", () => {
  const accessToken = token.signAccessToken(123, "admin");
  const decodedToken = token.verifyAccessToken(accessToken);

  expect(decodedToken).toHaveProperty(
    "sub",
    "role",
    "tokenType",
    "iss",
    "aud",
    "exp",
    "iat",
  );
  expect(decodedToken.sub).toBe(String(123));
  expect(decodedToken.role).toBe("admin");
  expect(decodedToken.tokenType).toBe(token.TOKEN_TYPE.ACCESS);
});

test("Create a refresh token with a user Id and JTI", () => {
  const jti = token.createJti();
  const refreshToken = token.signRefreshToken(543, jti);
  const decodedToken = token.verifyRefreshToken(refreshToken);
  expect(decodedToken).toHaveProperty(
    "sub",
    "jti",
    "tokenType",
    "iat",
    "exp",
    "aud",
    "iss",
  );
  expect(decodedToken.sub).toBe(String(543));
  expect(decodedToken.jti).toBe(String(jti));
  expect(decodedToken.tokenType).toBe(token.TOKEN_TYPE.REFRESH);
});

test("invalid secret for access token", () => {
  const invalid_jwt_secret = invalidAccessSecret();
  const payload = {
    id: 164,
    role: "admin",
    tokenType: token.TOKEN_TYPE.ACCESS,
  };

  const options = {
    algorithm: algorithm(),
    expiresIn: expiresIn(),
    issuer: issuer(),
    audience: audience(),
  };
  const invalidAccessToken = jwt.sign(payload, invalid_jwt_secret, options);
  try {
    token.verifyAccessToken(invalidAccessToken);
  } catch (error) {
    expect(error).toBeInstanceOf(jwt.JsonWebTokenError);
    expect(error.message).toBe("invalid signature");
  }
});

test("Invalid secret for refresh token", () => {
  const invalid_jwt_refresh_secret = invalidRefreshSecret();
  const payload = {
    sub: 1765,
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const options = {
    algorithm: algorithm(),
    expiresIn: expiresIn(),
    issuer: issuer(),
    audience: audience(),
  };

  try {
    jwt.sign(payload, invalid_jwt_refresh_secret, options);
  } catch (error) {
    exepct(error).toBeInstanceOf(jwt.JsonWebTokenError);
    expect(error.message).toBe("invalid signature");
  }
});
