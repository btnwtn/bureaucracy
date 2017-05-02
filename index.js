const mockAPI = {
  emailExists(email) {
    return new Promise(resolve => setTimeout(resolve(true), 300));
  }
};

const validateEmail = async email =>
  new Promise(resolve => {
    mockAPI.emailExists(email).then(exists => {
      resolve([
        email.length === 0 && "Email is required.",
        email.length < 3 && "Please provide a valid email.",
        !email.includes("@") && "Email must include @ symbol.",
        exists && "Email already exists."
      ]);
    });
  });

const validatePassword = async password =>
  new Promise(resolve => {
    resolve([password.length < 8 && "Password must be at least 8 characters."]);
  });

const makeValidator = rules => field => async value => {
  const validator = rules[field];
  if (!validator) throw new Error(`Missing validator for field: ${field}`);

  const errors = await validator(value);
  return errors.filter(v => v);
};

export default makeValidator;
