const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// const jwt_token = process.env.SECRET_KEY 

const jwt_token = process.env.JWT_SECRET || "default-secret-key";

function authenticateToken(req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    console.error("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token.split(" ")[1], jwt_token, (err, user) => {
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Please login to continue" });
    }

    console.log("Decoded user:", user);
    req.user = user;
    next();
  });
}



module.exports = { authenticateToken };