const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse, createTokenUser } = require("../utils");

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    throw new CustomError.BadRequestError("Please provide all required fields");
  }

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // First registered user is an admin, others are members
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "member";

  // Create the user in the database
  const user = await User.create({ email, name, password, role });

  // Create a token user object for the payload
  const tokenUser = createTokenUser(user);

  // Attach JWT cookie to the response
  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

/**
 * @desc    Login a user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError(
      "Please provide a valid email and password"
    );
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  // Create a token user object for the payload
  const tokenUser = createTokenUser(user);
  
  // Attach JWT cookie to the response
  attachCookiesToResponse({ res, user: tokenUser });
  
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  const tokenUser = createTokenUser(req.user);
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

/**
 * @desc    Logout a user
 * @route   GET /api/v1/auth/logout
 * @access  Private
 */
const logout = async (req, res) => {
  // The client-side should also remove the user info from state/storage
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out successfully!" });
};

module.exports = { register, login, logout, getCurrentUser };