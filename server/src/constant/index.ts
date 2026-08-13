export const corsAllowOrigin = {
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://fixitnow-frontend-theta.vercel.app/",
  ],
  credentials: true,
};

export const appName = "Health Care";

export const userServiceMessages = {
  NOT_VERIFIED: "Your account is not verified",
  PASSWORD_NOT_MATCH: "Your password does not match",
  ALL_FIELDS_REQUIRED: "All fields are required !!",
  EMAIL_ALREADY_EXISTS: "Email already exists",
  TOKEN_IS_REQUIRED: "Token is required !!",
  USER_REGISTRATION_FAILED: "User registration failed.",
  USER_NOT_FOUND: "User is not found !",
  USER_INACTIVE: "User is inactive !",
  INVALID_PIN: "Invalid pin",
  INVALID_TOKEN: "Invalid token",
  EMAIL_IS_REQUIRED: "Email is required !!",
  EMAIL_IS_EXISTS: "Email already exists !!",
  USER_ALREADY_EXISTS_IN_YOUR_FRIENDS:
    "User already exists in your friends list !!",
  USER_ALREADY_SENT_FRIEND_REQUEST:
    "You have already sent a friend request to this user !!",
  PASSWORD_LENGTH_ERROR: `Password must be at least  characters long.`,
};

export const userControllerMessages = {
  USER_CREATED: "Your account created successfully !!!",
  USER_LOGIN: "User login successfully !!!",
  CHECK_EMAIL_RESET_PASSWORD: "Check your email to reset password !!!",
  PASSWORD_UPDATED: "Password is updated successfully !!!",
  USER_CONFIRMED: "User account  confirmed successfully !!!",
  ACCEPT_INVITE: "Accept invite successfully",
  UPDATE_PASSWORD: "Password is updated successfully !!!",
  CHECK_USER: "Check User successfully !!!",
  EMAIL_SEND: "Email send successfully !!!",
  INVITE_USER: "Invite user",
  UPDATED_USER: "Updated successfully !!!",
  GOOGLE_LOGIN: "Google login successfully !!!",
  GOOGLE_REGISTER: "Google register successfully !!!",
  GET_FRIENDS: "Friends retrieved successfully !!!",
  BLOCK_USER: "You have blocked this user !!",
};

export const messageServiceMessages = {
  MESSAGE_SEND: "Message send successfully !!!",
  MESSAGE_GET: "Message get successfully !!!",
  MESSAGE_EDIT: "Message edit successfully !!!",
  USER_GET: "Users  get successfully !!!",
  ADD_EMOJI: "Add emoji  successfully !!!",
  REMOVE_EMOJI: "Remove emoji  successfully !!!",
  CHANGE_EMOJI: "Change emoji  successfully !!!",
  DELETE_MESSAGE: "Message deleted  successfully !!!",
  FORWARD_MESSAGE: "Forward message successfully !!!",
  REPLY_MESSAGE: "Reply message successfully !!!",
  CLEAR_MESSAGE: "Clear message successfully !!!",
  DELETE_MESSAGES: "Delete all messages successfully !!!",
};
export const authorizationError = {
  UN_AUTHORIZED: "You are not authorized",
};
export const emailSenderMessages = {
  FROM_JOIN_EMAIL: "shihab@gmail.com",
  WELCOME_EMAIL_SUBJECT: "Welcome to Chatty! Confirm your email address",
  FORGET_PASSWORD_SUBJECT: "Forget Your Password",
  INVITE_JOIN_SUBJECT: "Invite to join Chatty",
  INVITE_JOIN_MESSAGE: "Join Chatty and start chatting with your friends!",
  CONFIRM_EMAIL_MESSAGE:
    "Please confirm your Chatty account. Please click on the confirm button and then login to app.",
  FORGET_PASSWORD_MESSAGE:
    "Use this link and code to reset your password. This link and code will expire in 5 minutes",
};
