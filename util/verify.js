require("dotenv").config();
const jwt = require("jsonwebtoken");

function veriry(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, process.env.JWT_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden" });
    }
    req.user = user;
    console.log("come inside the middle wear", req.user);
    next();
  });
}

module.exports = veriry;
