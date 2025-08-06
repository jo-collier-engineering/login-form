export const validateEmail = (value: string): string => {
  if (!value) return "Email is required.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return "Enter a valid email address.";
  return "";
};

export const validatePassword = (value: string): string => {
  if (!value) return "Password is required.";
  if (!/[A-Z]/.test(value)) {
    return "Password must contain at least one uppercase letter.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return "Password must contain at least one special character.";
  }
  const digitMatches = value.match(/\d/g);
  if (!digitMatches || digitMatches.length < 2) {
    return "Password must contain at least two numbers.";
  }
  return "";
};

export const validateConfirmPassword = (value: string, password: string): string => {
  if (!value) return "Please confirm your password.";
  if (value !== password) return "Passwords do not match.";
  return "";
}; 