import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Bad auth (no token)" });
  }

  jwt.verify(token, process.env.JWT_RANDOMISER, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Bad auth (bad token)" });
    }

    req.body = req.body || {};
    req.body.userId = decoded.userId;

    next();
  });
};

export default authUser;