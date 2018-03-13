import test from 'ava';
import verify from '../../lib/branches/verify';

test.serial('Verify branches', async t => {
  await t.notThrows(verify([{name: 'master'}, {name: 'next'}, {name: 'beta'}]));
});

test.serial(
  'Throw a SemanticReleaseError for each branch without a name, with a duplicate or invalid name',
  async t => {
    const errors = [
      ...(await t.throws(
        verify([
          '',
          null,
          false,
          {},
          {name: ''},
          {name: 'master'},
          {name: 'master'},
          {name: 'master'},
          {name: 'master'},
          {name: 'test:'},
        ])
      )),
    ];

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
    t.is(errors[4].name, 'SemanticReleaseError');
    t.is(errors[4].code, 'EINVALIDBRANCH');
    t.truthy(errors[4].message);
    t.truthy(errors[4].details);
    t.is(errors[5].name, 'SemanticReleaseError');
    t.is(errors[5].code, 'EDUPLICATEBRANCHES');
    t.truthy(errors[5].message);
    t.truthy(errors[5].details);
    t.is(errors[6].name, 'SemanticReleaseError');
    t.is(errors[6].code, 'EINVALIDBRANCHNAME');
    t.truthy(errors[6].message);
    t.truthy(errors[6].details);
    t.is(errors.length, 7);
  }
);
