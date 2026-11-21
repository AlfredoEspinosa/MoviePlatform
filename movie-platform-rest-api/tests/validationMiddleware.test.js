const validationMiddleware = require("../middleware/validationMiddleware");

const runValidation = async (middleware, bodyFields) => {
  const req = bodyFields === undefined ? {} : { body: { ...bodyFields } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  const middlewareStack = Array.isArray(middleware) ? middleware : [middleware];

  for (const [index, handler] of middlewareStack.entries()) {
    const isLastHandler = index === middlewareStack.length - 1;

    if (isLastHandler) handler(req, res, next);
    else await new Promise((resolve) => handler(req, res, resolve));

    if (res.status.mock.calls.length > 0) {
      break;
    }
  }

  return { req, res, next };
};

describe("validateRequiredFields", () => {
  const validate = (fields) =>
    validationMiddleware.validateRequiredFields(fields);

  test("rejects a missing body", async () => {
    const { next, res } = await runValidation(
      validate(["username", "email", "password"]),
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "The request do not contain a body",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects missing fields", async () => {
    const { next, res } = await runValidation(
      validate(["username", "email", "password"]),
      { username: "AdewkjunbXXSA", password: "asdwed#4r34" },
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Missing required fields [email]",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a null field", async () => {
    const { next, res } = await runValidation(validate(["username"]), {
      username: null,
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Missing required fields [username]",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test.each(["", "   "])("rejects a blank field %p", async (username) => {
    const { next, res } = await runValidation(validate(["username"]), {
      username,
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: "Missing required fields [username]",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("calls next for a valid body", async () => {
    const { next, res } = await runValidation(
      validate(["username", "email", "password"]),
      {
        username: "movieFan",
        email: "fan@example.com",
        password: "FantasticPass",
      },
    );

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

describe("validateUserNamePolicy", () => {
  test("accepts a valid username", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateUserNamePolicy,
      { userName: "movieFan1" },
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects a username shorter than five characters", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateUserNamePolicy,
      { userName: "abc" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe(
      "Username must be at least 5 characters",
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects invalid characters", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateUserNamePolicy,
      { userName: "movie_fan" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe(
      "Username must contain only letters and nmumbers",
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validateEmail", () => {
  test("accepts a valid email", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateEmail,
      { email: "fan@example.com" },
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects an invalid email", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateEmail,
      { email: "not-an-email" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe(
      "Invalid email format",
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects an empty email", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validateEmail,
      { email: "" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe("Email is required");
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validatePasswordPolicy", () => {
  test("accepts a valid password", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validatePasswordPolicy,
      { password: "MoviePass1!" },
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects a password without a capital letter", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validatePasswordPolicy,
      { password: "moviepass1!" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe(
      "Password must contain at least one capital letter",
    );
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects a password without a special character", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validatePasswordPolicy,
      { password: "MoviePass1" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toContain(
      "Password must contain at least one of these special character",
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe("validatePasswordConfirmation", () => {
  test("accepts matching passwords", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validatePasswordConfirmation,
      { password: "MoviePass1!", passwordConfirmation: "MoviePass1!" },
    );
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects mismatched passwords", async () => {
    const { next, res } = await runValidation(
      validationMiddleware.validatePasswordConfirmation,
      { password: "MoviePass1!", passwordConfirmation: "OtherPass1!" },
    );
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].errors[0].msg).toBe(
      "Missmatch in password and confirmation",
    );
    expect(next).not.toHaveBeenCalled();
  });
});
