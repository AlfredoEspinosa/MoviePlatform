require("dotenv").config({
  path: "tests/.env.test",
});
const token = require("../utils/token");
const jwt = require("jsonwebtoken");
const helpers = require("../utils/helpers");

// using helper function to get environment variables values
const accessSecret = () => helpers.getEnv("JWT_SECRET");
const invalidAccessSecret = () => helpers.getEnv("JWT_INVALID_SECRET");
const invalidRefreshSecret = () => helpers.getEnv("JWT_INVALID_REFRESH_SECRET");
const accessTtl = () => helpers.getEnv("JWT_EXPIRES_IN");
const refreshTtl = () => helpers.getEnv("JWT_REFRESH_EXPIRES_IN");
const algorithm = () => helpers.getEnv("ALGORITHM");
const issuer = () => helpers.getEnv("ISSUER");
const audience = () => helpers.getEnv("AUDIENCE");

const options = {
  algorithm: algorithm(),
  expiresIn: accessTtl(),
  issuer: issuer(),
  audience: audience(),
};

//#region Create an access Token with user ID and role
test("Create an access Token with user ID and role", () => {
  const accessToken = token.signAccessToken(123, "admin");
  const decodedToken = token.verifyAccessToken(accessToken);

  expect(decodedToken).toHaveProperty("sub");
  expect(decodedToken).toHaveProperty("role");
  expect(decodedToken).toHaveProperty("sub");
  expect(decodedToken).toHaveProperty("tokenType");
  expect(decodedToken).toHaveProperty("iss");
  expect(decodedToken).toHaveProperty("aud");
  expect(decodedToken).toHaveProperty("exp");
  expect(decodedToken).toHaveProperty("iat");

  expect(decodedToken.sub).toBe(String(123));
  expect(decodedToken.role).toBe("admin");
  expect(decodedToken.tokenType).toBe(token.TOKEN_TYPE.ACCESS);
});
//#endregion

//#region Create a refresh token with a user Id and JTI
test("Create a refresh token with a user Id and JTI", () => {
  const jti = token.createJti();
  const refreshToken = token.signRefreshToken(543, jti);
  const decodedToken = token.verifyRefreshToken(refreshToken);

  expect(decodedToken).toHaveProperty("sub");
  expect(decodedToken).toHaveProperty("tokenType");
  expect(decodedToken).toHaveProperty("iss");
  expect(decodedToken).toHaveProperty("aud");
  expect(decodedToken).toHaveProperty("exp");
  expect(decodedToken).toHaveProperty("iat");
  expect(decodedToken).toHaveProperty("jti");

  expect(decodedToken.sub).toBe(String(543));
  expect(decodedToken.jti).toBe(String(jti));
  expect(decodedToken.tokenType).toBe(token.TOKEN_TYPE.REFRESH);
});
//#endregion

//#region invalid secret for access token
test("invalid secret for access token", () => {
  const invalid_jwt_secret = invalidAccessSecret();
  const payload = {
    id: 164,
    role: "admin",
    tokenType: token.TOKEN_TYPE.ACCESS,
  };

  const invalidAccessToken = jwt.sign(payload, invalid_jwt_secret, options);
  expect(() => token.verifyAccessToken(invalidAccessToken)).toThrow(
    `invalid signature`,
  );
});
//#endregion

//#region Invalid secret for refresh token
test("Invalid secret for refresh token", () => {
  const invalid_jwt_refresh_secret = invalidRefreshSecret();

  const payload = {
    sub: 1765,
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const testOptions = options;
  testOptions.expiresIn = refreshTtl();
  const invalidSecretRefreshToken = jwt.sign(
    payload,
    invalid_jwt_refresh_secret,
    testOptions,
  );

  expect(() => token.verifyRefreshToken(invalidSecretRefreshToken)).toThrow(
    `invalid signature`,
  );
});
//#endregion

//#region wrong token type access as refresh
test("region wrong token type access as refresh", () => {
  const jwt_secret = accessSecret();
  const payload = {
    sub: String(6321),
    role: "user",
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const wrongTokenType = jwt.sign(payload, jwt_secret, options);
  expect(() => token.verifyAccessToken(wrongTokenType)).toThrow(
    `Invalid token type`,
  );
});
//#endregion

//#region invalid role
test("invalid role", () => {
  const id = 213324;
  const role = "x-role";
  expect(() => token.signAccessToken(id, role)).toThrow(
    `${role} is not a valid role`,
  );
});
//#endregion
