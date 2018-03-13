import test from 'ava';
import tempy from 'tempy';
import verify from '../lib/verify';
import {gitRepo} from './helpers/git-utils';

// Save the current working diretory
const cwd = process.cwd();

test.afterEach.always(() => {
  // Restore the current working directory
  process.chdir(cwd);
});

test.serial('Throw a AggregateError', async t => {
  await gitRepo();

  const errors = [
    ...(await t.throws(verify({branches: [{name: 'master'}, {name: ''}, {name: 'master'}, {name: '~invalid'}]}))),
  ];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOREPOURL');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'EINVALIDTAGFORMAT');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'ETAGNOVERSION');
  t.truthy(errors[2].message);
  t.truthy(errors[2].details);
  t.is(errors[3].name, 'SemanticReleaseError');
  t.is(errors[3].code, 'EINVALIDBRANCH');
  t.truthy(errors[3].message);
  t.truthy(errors[3].details);
  t.is(errors[4].name, 'SemanticReleaseError');
  t.is(errors[4].code, 'EDUPLICATEBRANCHES');
  t.truthy(errors[4].message);
  t.truthy(errors[4].details);
  t.is(errors[5].name, 'SemanticReleaseError');
  t.is(errors[5].code, 'EINVALIDBRANCHNAME');
  t.truthy(errors[5].message);
  t.truthy(errors[5].details);
});

test.serial('Throw a SemanticReleaseError if does not run on a git repository', async t => {
  const dir = tempy.directory();
  process.chdir(dir);

  const errors = [...(await t.throws(verify({branches: []})))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOGITREPO');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
});

test.serial('Throw a SemanticReleaseError if the "tagFormat" is not valid', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `?\${version}`, branches: []};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDTAGFORMAT');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
});

test.serial('Throw a SemanticReleaseError if the "tagFormat" does not contains the "version" variable', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: 'test', branches: []};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ETAGNOVERSION');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
});

test.serial('Throw a SemanticReleaseError if the "tagFormat" contains multiple "version" variables', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `\${version}v\${version}`, branches: []};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ETAGNOVERSION');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
});

test.serial('Throw a SemanticReleaseError for each invalid branch', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `v\${version}`, branches: [{name: ''}, {name: '  '}, {name: 1}, 'master']};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDBRANCH');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'EINVALIDBRANCH');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'EINVALIDBRANCH');
  t.truthy(errors[2].message);
  t.truthy(errors[2].details);
  t.is(errors[3].name, 'SemanticReleaseError');
  t.is(errors[3].code, 'EINVALIDBRANCH');
  t.truthy(errors[3].message);
  t.truthy(errors[3].details);
});

test.serial('Throw a SemanticReleaseError if there is duplicate branches', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `v\${version}`, branches: [{name: 'master'}, {name: 'master'}]};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EDUPLICATEBRANCHES');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
});

test.serial('Throw a SemanticReleaseError for each invalid branch name', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `v\${version}`, branches: [{name: '~master'}, {name: '^master'}]};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDBRANCHNAME');
  t.truthy(errors[0].message);
  t.truthy(errors[0].details);
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'EINVALIDBRANCHNAME');
  t.truthy(errors[1].message);
  t.truthy(errors[1].details);
});

test.serial('Return "true" if all verification pass', async t => {
  const repositoryUrl = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `v\${version}`, branches: [{name: 'master'}]};

  await t.notThrows(verify(options));
});
