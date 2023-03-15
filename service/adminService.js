const User = require('../database/models/userModel');
const constants = require('../constants');
const { formatMongoData } = require('../helper/dbHelper');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.login = async ({ email, password, IP="" }) => {
  try {
    const user = await User.findOne({ email,status: "active", is_deleted: "n",user_type:"admin" });
    if (!user) {
      return { status: false, message: constants.userMessage.USER_NOT_FOUND };
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { status: false, message: constants.userMessage.INVALID_PASSWORD };
    }
    let userDetail = await User.findOneAndUpdate(
      {
        _id: user.id,
      },
      { last_login: new Date(),last_login_ip: IP?IP:"" },
      {
        new: true,
        useFindAndModify: false,
      }
    );
    return { status: true, message: "success", data: formatMongoData(userDetail) };
    
  } catch (error) {
    console.log('Something went wrong: Service: login', error);
    throw new Error(error);
  }

}