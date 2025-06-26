export const ToastMessages = {
  server: {
    generic: "An unexpected error occurred. Try again later.",
  },
  auth: {
    loginFailed: "Login failed. Please check your credentials.",
    signupSuccess:
      "Signup successful! Please check your email to verify your account.",
    signupFailed: "Signup failed. Please try again.",
    invalid2FA: "Invalid code. Please try again.",
    setupLinkCopied:
      "Link copied! Paste it in your authenticator app if you can't scan the QR.",
    verificationFailed: "Verification failed. Please try again.",
    passwordDoesNotMatch: "Passwords do not match. Please try again.",
    passwordNotStrongEnough:
      "Password is not strong enough. Please use a stronger password.",
    missingFields: "Please fill in all required fields.",
    qrFetchFailed: "Failed to fetch QR code. Please try again.",
    qrNetworkError: "Network error while fetching QR code. Please try again.",
  },
  resetPassword: {
    success: "Password reset email sent.",
    error: "Could not send reset email. Please try again.",
    missingToken: "Invalid request. Token is missing.",
    passwordUpdated: "Your password has been updated successfully!",
  },
  credentials: {
    create: {
      success: "Credential saved successfully",
      error: "Error saving credential. Please try again.",
    },
    delete: {
      success: "Credential deleted successfully",
      error: "Error deleting credential. Please try again.",
    },
    copy: {
      success: "Password copied to clipboard!",
      error: "Failed to copy password. Please try again.",
      unsupported: "Clipboard not supported in this browser.",
    },
  },
  device: {
    notReady: "Device not ready. Please try again later.",
  },
};
