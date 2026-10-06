const userModel = require("../models/userModel");

const getAllUsers = async () => {
  const users = await userModel.getAllUsers();

  return users;
};

module.exports = {
  getAllUsers,
};
