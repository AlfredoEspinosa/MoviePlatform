const tokenVerifier = require("../utils/token");

const verifyToken = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      error: "Authorization header is required",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme != "Bearer") {
    return res.status(401).json({
      error: "Authorization header must use Bearer Schenme",
    });
  }

  try {
    const decodedToken = tokenVerifier.verifyAccessToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({
      error: `Invalid token: ${error.message}`,
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: "user is required",
    });
  }

  if (req.user.role.trim() != "admin") {
    return res.status(403).json({
      error: "Forbidden access for user",
    });
  }
  next();
};

module.exports = { verifyToken, requireAdmin };
