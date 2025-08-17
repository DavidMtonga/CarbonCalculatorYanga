const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  prisma,
  User: prisma.user,
  Calculation: prisma.calculation,
};
