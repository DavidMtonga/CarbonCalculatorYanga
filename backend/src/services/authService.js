const { prisma } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

exports.registerUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
      role: "USER",
    },
  });
};

exports.authenticateUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid password");

  return user;
};

exports.generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};
