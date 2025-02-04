const jwt = require ("jsonwebtoken");

  const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    secure: process.env.NODE_ENV !== "production",
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
  });

  return token;
};

module.exports = { generateToken }