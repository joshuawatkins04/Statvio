// Field validation helpers shared by the account forms. Each returns a map of
// named rules to booleans so the UI can render per-rule pass/fail checklists.

export function validateUsername(username: string) {
  return {
    length: username.length >= 4 && username.length <= 20,
    validCharacters: /^[a-zA-Z0-9_]*$/.test(username),
    noSpaces: !/\s/.test(username),
  }
}

export function validateEmail(email: string) {
  return {
    length: email.length >= 5 && email.length <= 45,
    hasAtSymbol: /@/.test(email),
    hasDomain: /@[a-zA-Z0-9.-]+/.test(email),
    hasValidTLD: /\.[a-zA-Z]{2,}$/.test(email),
    noSpaces: !/\s/.test(email),
    validCharacters:
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
  }
}

export function validatePassword(password: string, confirmPassword: string) {
  return {
    length: password.length >= 8 && password.length <= 40,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    specialCharacters: /[@$!%*?&]/.test(password),
    matchesConfirm: password === confirmPassword && confirmPassword !== "",
  }
}
