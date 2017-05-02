# Form Bureaucracy

> Async form validation.

## Installing

```
$ npm install --save form-bureaucracy
```

## Getting Started

1. Create a set of [Rules](#rules).
2. Use [`createValidator`](#createvalidator) to create a Rule Validator.
3. Use the Rule Validator to specify which field to validate against.
4. Validate some input!


### Rules

`Rules` are functions that accept an input and may return any `Truthy` value. For example, a `Rule` to validate some innane requirements for a password would look like this:

```js
const validatePassword = password => {
  const errors = [];

  if (password.length > 16) {
    errors.append("Password can not be secure.");
  }
  if (/[!@#\$%\^&\*\(\)]/.test(password)) {
    errors.append("Password can not contain special characters.");
  }

  return errors;
};
```

`Rules` can optionally return a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) if any asynchronous work is required by the `Rule`. For example:

```js
const validateEmail = email => {
  return new Promise(resolve => {
    SomeAPI.doesEmailExist(email).then(emailExists => {
      const errors = [];

      if (emailExists) {
        errors.push("Email is already in use!");
      }

      resolve(errors);
    });
  });
};
```

### createValidator

`createValidator` accepts an Object that maps form inputs to their Validation `Rules`, and returns a `Field Validator` function that accepts a field to validate against. For example, given an input `email`, the `createValidator` call would like this:

```js
import { createValidator } from "form-bureaucracy";

const rules = {
  email: email => {
    return [
      email.length === 0 && "Email address is required.",
      !email.includes("@") && `Email address must include an '@' symbol.`
    ];
  }
};

const fieldValidator = createValidator(rules);
const emailValidator = fieldValidator("email");
```

### Field Validator

`Field Validators` are functions which accept an input, and return a `Promise` that resolves to an `Array` of potential errors; they are created by the `createValidator` function. They are used like any other `Promise`, e.g.

```js
const emailValidator = fieldValidator("email");

emailValidator("email@example.com").then(errors => {
  if (errors.length) {
    console.log("something is up with this email...");
  }
});
```


## Examples

### Basic Field Validation

```js
import { createValidator } from "form-bureaucracy";

// define a set of rules for form fields to be validated against.
const rules = {
  email: email => {
    return [
      email.length === 0 && "Email address is required.",
      !email.includes("@") && `Email address must include an '@' symbol.`
    ];
  }
};

// create the fieldValidator function
const fieldValidator = createValidator(rules);
const emailValidator = fieldValidator("email");

// validate that field...
emailValidator("email@example.com").then(errors => {
  if (errors.length) {
    return console.log(errors);
  }

  console.log("No errors found.");
});
```

### Asynchronous Rules

You can return a `Promise` from a `Rule` if you need to make any API calls or do any asynchronous work. 

```js
import { createValidator } from "form-bureaucracy";

const MockAPI = {
  doesEmailExist: email => {
    // emulate HTTP Request latency
    return new Promise(resolve => setTimeout(resolve(true), 300));
  }
};

const rules = {
  email: input => {
    // Return a Promise instead of an Array.
    return new Promise(resolve => {
      // Make API call to validate the input.
      MockAPI.doesEmailExist(input).then(emailExists => {
        // Resolve with any errors.
        resolve([
          input.length === 0 && "Email address is required.",
          emailExists && "Email address is taken!"
        ]);
      });
    });
  }
};

const fieldValidator = createValidator(rules);
const emailValidator = fieldValidator("email");

// console.log the response
emailValidator("email@example.com").then(console.log);
```
