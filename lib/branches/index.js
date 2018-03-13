const AggregateError = require('aggregate-error');
const DEFINITIONS = require('../definitions/branches');
const getError = require('../get-error');
const verify = require('./verify');
const normalize = require('./normalize');

module.exports = async branches => {
  await verify(branches);

  const errors = [];
  const branchesByType = Object.entries(DEFINITIONS).reduce(
    (branchesByType, [type, {filter}]) => ({[type]: branches.filter(filter), ...branchesByType}),
    {}
  );

  const result = Object.entries(DEFINITIONS).reduce((result, [type, {branchesValidator, branchValidator}]) => {
    branchesByType[type].forEach(branch => {
      if (branchValidator && !branchValidator(branch)) {
        errors.push(getError(`E${type.toUpperCase()}BRANCH`, {branch}));
      }
    });

    const branchesOfType = normalize[type](branchesByType);

    if (!branchesValidator(branchesOfType)) {
      errors.push(getError(`E${type.toUpperCase()}BRANCHES`, {branches: branchesOfType}));
    }

    return [...result, ...branchesOfType];
  }, []);

  if (errors.length > 0) {
    throw new AggregateError(errors);
  }

  return result;
};
