const rejectFalsey = collection => {
  if (typeof collection === "undefined") return [];

  if (Array.isArray(collection)) {
    return collection.filter(v => v);
  } else {
    return [collection].filter(v => v);
  }
};

const createValidator = rules =>
  field =>
    value => {
      return new Promise(resolve => {
        const validator = rules[field];

        if (!validator) {
          throw new Error(
            `Missing validator for field: ${JSON.stringify(field)}`
          );
        }

        const result = validator(value);

        if (typeof result === "undefined") {
          throw new Error(
            `Rule for ${JSON.stringify(field)} returned undefined.`
          );
        }

        if (typeof result.then === "function") {
          return result.then(errors => {
            resolve(rejectFalsey(errors));
          });
        }

        return resolve(rejectFalsey(result));
      });
    };

export default createValidator;
