import jwt from "jsonwebtoken";

export const authenticateAdmin = (req, res, next) => {
  try {
    // console.log("Middleware hit");
    const token = req.cookies["admin-token"];
    if (!token) {
      return res.status(401).json({
        message: "no authentication token",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(404).json({
      message: "Invalid token",
    });
  }
};
