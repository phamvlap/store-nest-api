const AUTH_LOGIN_FAILED = {
  code: 'auth_login_failed',
  message: 'Email or password is incorrect',
};

const AUTH_UNAUTHORIZED = {
  code: 'auth_unauthorized',
  message: 'Unauthorized',
};

const AUTH_FAILED_RESET_PASSWORD = {
  code: 'auth_failed_reset_password',
  message: 'Failed to reset password',
};

const AUTH_FORBIDDEN = {
  code: 'auth_forbidden',
  message: 'You do not have permission for this action',
};

export {
  AUTH_LOGIN_FAILED,
  AUTH_UNAUTHORIZED,
  AUTH_FAILED_RESET_PASSWORD,
  AUTH_FORBIDDEN,
};
