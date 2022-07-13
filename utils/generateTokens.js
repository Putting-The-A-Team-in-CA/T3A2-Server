import jwt from "jsonwebtoken";
const Token = require("../models/tokenModel");

// Creates token with user id and role
const generateToken = async (user) => {
  try {
    const payload = { _id: user._id, roles: user.roles };
    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_PRIVATE_KEY,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY,
      { expiresIn: "1d" }
    );

    // Check for (and remove) existing user token
    const userToken = await Token.findOne({ userId: user._id });
    if (userToken) {
      await userToken.remove();
    }

    // Create new token
    await new Token({ userId: user._id, token: refreshToken }).save();
    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

export default generateToken;