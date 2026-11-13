require("dotenv").config({
  path: "tests/.env.test",
  quiet: true,
});
const token = require("../utils/token");
const jwt = require("jsonwebtoken");
const helpers = require("../utils/helpers");

// using helper function to get environment variables values
const accessSecret = () => helpers.getEnv("JWT_SECRET");
const accessRefreshSecret = () => helpers.getEnv("JWT_REFRESH_SECRET");
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
  expect(typeof decodedToken.jti).toBe("string");
  expect(decodedToken.jti).not.toBe("");
  expect(decodedToken.jti).toBe(jti);
  expect(decodedToken.tokenType).toBe(token.TOKEN_TYPE.REFRESH);
});
//#endregion

//#region invalid secret
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

test("Invalid secret for refresh token", () => {
  const invalid_jwt_refresh_secret = invalidRefreshSecret();

  const payload = {
    sub: 1765,
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const testOptions = Object.assign({}, options);
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

//#region Access token type verified as refresh
test("Access token type verified as refresh", () => {
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

//#region Refresh token type verified as access
test("Refresh token type verified as access", () => {
  const jwt_secret = accessRefreshSecret();
  const payload = {
    sub: String(6321),
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.ACCESS,
  };

  const wrongTokenType = jwt.sign(payload, jwt_secret, options);
  expect(() => token.verifyRefreshToken(wrongTokenType)).toThrow(
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

//#region missing, empty and malformed token
test("missing access token verification", () => {
  const payload = {
    sub: String(56),
    role: "admin",
    tokenType: token.TOKEN_TYPE.ACCESS,
  };

  expect(() => token.verifyAccessToken(payload, null, options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() => token.verifyAccessToken(payload, "", options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() => token.verifyAccessToken(payload, " ", options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() =>
    token.verifyAccessToken(
      payload,
      "453rd)x(/asd/&$&_MalformedToken_1dnlkjsnr23423fklunu8383",
      options,
    ),
  ).toThrow("Token is missing or malformed");
});

test("missing refresh verification", () => {
  const payload = {
    sub: String(56),
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const testOptions = Object.assign({}, options);
  testOptions.expiresIn = refreshTtl();

  expect(() => token.verifyRefreshToken(payload, null, options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() => token.verifyRefreshToken(payload, "", options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() => token.verifyRefreshToken(payload, " ", options)).toThrow(
    "Token is missing or malformed",
  );
  expect(() =>
    token.verifyRefreshToken(
      payload,
      "453rd)x(/asd/&$&_MalformedToken_1dnlkjsnr23423fklunu8383",
      options,
    ),
  ).toThrow("Token is missing or malformed");
});
//#endregion

//#region expired tokens
test("expired Acess token", () => {
  const jwt_secret = accessSecret();
  const payload = {
    sub: String(324321),
    role: "user",
    tokenType: token.TOKEN_TYPE.ACCESS,
  };

  const testOptions = Object.assign({}, options);
  testOptions.expiresIn = "-1m"; // negative timing to already have an expired token from creation
  const accessToken = jwt.sign(payload, jwt_secret, testOptions);
  expect(() => token.verifyAccessToken(accessToken)).toThrow("jwt expired");
});

test("expired refresh token", () => {
  const jwt_refresh_secret = accessRefreshSecret();
  const payload = {
    sub: String(23),
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };

  const testOptions = Object.assign({}, options);
  testOptions.expiresIn = "-1m"; // negative timing to already have an expired token from creation
  const refreshToken = jwt.sign(payload, jwt_refresh_secret, testOptions);
  expect(() => token.verifyRefreshToken(refreshToken)).toThrow("jwt expired");
});
//#endregion

//#region Wrong issuer and audience
test("invalid issuer", () => {
  const jwt_secret = accessSecret();
  const payload = {
    sub: String(123),
    role: "user",
    tokenType: token.TOKEN_TYPE.ACCESS,
  };
  const testOptions = Object.assign({}, options);
  testOptions.issuer = "Wrong-Issuer";
  const wrongIssuerToken = jwt.sign(payload, jwt_secret, testOptions);
  expect(() => token.verifyAccessToken(wrongIssuerToken)).toThrow(
    `jwt issuer invalid. expected: ${issuer()}`,
  );
});

test("invalid audience", () => {
  const jwt_refresh_secret = accessRefreshSecret();
  const payload = {
    sub: String(123),
    jti: token.createJti(),
    tokenType: token.TOKEN_TYPE.REFRESH,
  };
  const testOptions = Object.assign({}, options);
  testOptions.audience = "Wrong-Audience";
  const wrongIssuerToken = jwt.sign(payload, jwt_refresh_secret, testOptions);
  expect(() => token.verifyRefreshToken(wrongIssuerToken)).toThrow(
    `jwt audience invalid. expected: ${audience()}`,
  );
});
//#endregion

//#region Missing or empty payload attributes (sub, tokenType, jti, role)
test("Missing sub", () => {
  expect(() => token.signAccessToken(null, "user")).toThrow(
    "signAccessToken: id is required",
  );
});

test("Empty sub", () => {
  expect(() => token.signAccessToken("", "user")).toThrow(
    "signAccessToken: id is required",
  );
});

test("Missing jti", () => {
  expect(() => token.signRefreshToken(1234, null)).toThrow(
    "signRefreshToken: jti is required",
  );
});

test("Empty jti", () => {
  expect(() => token.signRefreshToken(1234, "")).toThrow(
    "signRefreshToken: jti is required",
  );
});

test("Missing role", () => {
  expect(() => token.signAccessToken(12312, null)).toThrow(
    "signAccessToken: role is required",
  );
});

test("Empty role", () => {
  expect(() => token.signAccessToken(12312, "")).toThrow(
    "signAccessToken: role is required",
  );
});
//#endregion
