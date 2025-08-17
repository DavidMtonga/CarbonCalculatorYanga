// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const ApiError = require("../utils/apiError");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          401,
          "Authentication required. Please log in to get access."
        )
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists in database
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!currentUser) {
      return next(
        new ApiError(401, "The user belonging to this token no longer exists.")
      );
    }

    // Check if token was issued before password change (optional security feature)
    if (decoded.iat && currentUser.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        currentUser.passwordChangedAt.getTime() / 1000,
        10
      );
      if (decoded.iat < passwordChangedTimestamp) {
        return next(
          new ApiError(
            401,
            "User recently changed password. Please log in again."
          )
        );
      }
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid token. Please log in again."));
    } else if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Token expired. Please log in again."));
    }
    next(error);
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new ApiError(403, "Admin access required"));
  }

  next();
};

// Middleware to authorize specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Access denied. Required roles: ${roles.join(", ")}`)
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorizeAdmin,
  authorize,
};
