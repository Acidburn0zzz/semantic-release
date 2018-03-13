const {isUndefined, uniqBy} = require('lodash');
const semver = require('semver');
const {isLtsRange} = require('../utils');

const lts = {
  filter: ({name, range}) => !isUndefined(range) || isLtsRange(name),
  branchValidator: ({range}) => (isUndefined(range) ? true : isLtsRange(range)),
  branchesValidator: branches => uniqBy(branches, ({range}) => semver.validRange(range)).length === branches.length,
};

const prerelease = {
  filter: ({prerelease}) => !isUndefined(prerelease),
  branchValidator: ({name, prerelease}) =>
    Boolean(prerelease) && Boolean(semver.valid(`1.0.0-${prerelease === true ? name : prerelease}.1`)),
  branchesValidator: branches => uniqBy(branches, 'prerelease').length === branches.length,
};

const release = {
  filter: branch => !lts.filter(branch) && !prerelease.filter(branch),
  branchesValidator: branches => branches.length <= 3 && branches.length > 0,
};

module.exports = {lts, prerelease, release};
