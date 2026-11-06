//Helper function to validate and revtreive values from environments
function getEnv(envName) {
  const value = process.env[envName];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required environment variable : ${envName}`);
  }
  return value;
}

module.exports = { getEnv };
