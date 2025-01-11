export const validateUsername = (username) => {
  return {
    length: username.length >= 4 && username.length <= 20,
    validCharacters: /^[a-zA-Z0-9_]*$/.test(username),
    noSpaces: !/\s/.test(username),
  };
};

export const validateEmail = (email) => {
  return {
    length: email.length >= 5 && email.length <= 45,
    hasAtSymbol: /@/.test(email),
    hasDomain: /@[a-zA-Z0-9.-]+/.test(email),
    hasValidTLD: /\.[a-zA-Z]{2,}$/.test(email),
    noSpaces: !/\s/.test(email),
    validCharacters: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
  };
};

export const validatePassword = (password, confirmPassword) => {
  return {
    length: password.length >= 8 && password.length <= 40,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialCharacters: /[@$!%*?&]/.test(password),
    matchesConfirm: password === confirmPassword && confirmPassword !== "",
  };
};