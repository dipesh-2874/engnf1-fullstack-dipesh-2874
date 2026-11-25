const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/

export function validateCredentials({ name, email, password }) {
  const errors = {}

  if (name !== undefined && (name.length < 2 || name.length > 50)) {
    errors.name = 'Enter a name between 2 and 50 characters.'
  }

  if (email.length > 254 || !emailPattern.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!password) {
    errors.password = 'Enter your password.'
  } else if (name !== undefined && !passwordPattern.test(password)) {
    errors.password = 'Use 8 to 64 characters, including a letter and a number.'
  }

  return errors
}
