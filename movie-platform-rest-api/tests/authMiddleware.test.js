require("dotenv").config({
  path: "tests/.env.test",
  quiet: true,
});
const token = require("../utils/token");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

//#region -  valid user token
test("Valid user token", () => {
  const id = 25;
  const role = "user";
  //1 .- creation of valid access token
  const accessToken = token.signAccessToken(id, role);
  //2 .- mock for request object
  const req = {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };
  //3 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //4 .- Mock next()
  const next = jest.fn();

  //5 .- call the middleware
  verifyToken(req, res, next);

  //6 .- assertions

  expect(next).toHaveBeenCalledTimes(1);
  expect(next).toHaveBeenCalledWith();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  // Confirm decoded values are attached to req.user
  expect(req.user).toBeDefined();
  expect(req.user.sub).toBe(String(id));
  expect(req.user.role).toBe(role);
});
//#endregion

//#region  - valid admin-token
test("Valid admin-token", () => {
  const id = 54234;
  const role = "admin";
  //1 .- creation of valid access token
  const accessToken = token.signAccessToken(id, role);
  //2 .- mock for request object
  const req = {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };
  //3 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //4 .- Mock next()
  const next = jest.fn();

  //5 .- call the middleware
  verifyToken(req, res, next);
  requireAdmin(req, res, next);

  //6 .- assertions

  expect(next).toHaveBeenCalledTimes(2);
  expect(next).toHaveBeenCalledWith();
  expect(res.status).not.toHaveBeenCalled();
  expect(res.json).not.toHaveBeenCalled();

  // Confirm decoded values are attached to req.user
  expect(req.user).toBeDefined();
  expect(req.user.sub).toBe(String(id));
  expect(req.user.role).toBe(role);
});
//#endregion

//#region  - invalid admin-token (require admin)
test("Invalid admin-token (require admin)", () => {
  const id = 1151285;
  const role = "user";
  //1 .- creation of valid access token
  const accessToken = token.signAccessToken(id, role);
  //2 .- mock for request object
  const req = {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };
  //3 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //4 .- Mock next()
  const next = jest.fn();

  //5 .- call the middleware
  verifyToken(req, res, next); // It creates req.user from the decoded token after previous verification
  requireAdmin(req, res, next);

  //6 .- assertions
  expect(next).toHaveBeenCalledTimes(1); // this step should be successful and feed req.user object
  expect(res.status).toHaveBeenCalledTimes(1);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(res.json).toHaveBeenCalledWith({
    error: "Forbidden access for user",
  });

  // Confirm decoded values are attached to req.user
  expect(req.user).toBeDefined();
  expect(req.user.sub).toBe(String(id));
  expect(req.user.role).toBe(role);
});
//#endregion

//#region  - missing user admin-token (require admin)

test("Missing admin-token (require admin)", () => {
  const id = 1151285;
  const role = "admin";
  //1 .- creation of valid access token
  const accessToken = token.signAccessToken(id, role);
  //2 .- mock for request object
  const req = {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  };
  //3 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //4 .- Mock next()
  const next = jest.fn();

  //5 .- call the middleware
  requireAdmin(req, res, next);

  //6 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({
    error: "user is required",
  });

  // Confirm req.user do not exists
  expect(req.user).not.toBeDefined();
});
//#endregion

//#region  - missing authorization header
test("Missing authorization header", () => {
  //1 .- mock for request object
  const req = {
    headers: {},
  };
  //2 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //3 .- Mock next()
  const next = jest.fn();

  //4 .- call the middleware
  verifyToken(req, res, next);

  //5 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    error: "Authorization header is required",
  });
  expect(req.user).not.toBeDefined();
});
//#endregion

//#region  - incorrect authorization scheme
test("Incorrect authorization scheme", () => {
  //1 .- mock for request object
  const req = {
    headers: {
      authorization: "Basic 32evWr♫65$#%&cxaF#$D",
    },
  };
  //3 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //4 .- Mock next()
  const next = jest.fn();

  //5 .- call the middleware
  verifyToken(req, res, next);

  //6 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    error: "Authorization header must use Bearer Schenme",
  });
  expect(req.user).not.toBeDefined();
});
//#endregion

//#region  - missing bearer token "Bearer"
test(`Missing bearer token "Beaerer"`, () => {
  //1 .- mock for request object
  const req = {
    headers: {
      authorization: "Bearer",
    },
  };
  //2 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //3 .- Mock next()
  const next = jest.fn();

  //4 .- call the middleware
  verifyToken(req, res, next);

  //5 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    error: "Invalid token: Token is missing or malformed",
  });
  expect(req.user).not.toBeDefined();
});
//#endregion

//#region  - missing bearer token "Bearer "
test(`Missing bearer token "Beaerer  "`, () => {
  //1 .- mock for request object
  const req = {
    headers: {
      authorization: "Bearer ",
    },
  };
  //2 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //3 .- Mock next()
  const next = jest.fn();

  //4 .- call the middleware
  verifyToken(req, res, next);

  //5 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    error: "Invalid token: Token is missing or malformed",
  });
  expect(req.user).not.toBeDefined();
});
//#endregion

//#region  - missing bearer token "Bearer  "
test(`Missing bearer token "Beaerer   "`, () => {
  //1 .- mock for request object
  const req = {
    headers: {
      authorization: "Bearer  ",
    },
  };
  //2 .- Building the mock response
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  //3 .- Mock next()
  const next = jest.fn();

  //4 .- call the middleware
  verifyToken(req, res, next);

  //5 .- assertions

  expect(next).not.toHaveBeenCalled();
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toBeDefined();
  expect(res.json).toHaveBeenCalledWith({
    error: "Invalid token: Token is missing or malformed",
  });
  expect(req.user).not.toBeDefined();
});
//#endregion
