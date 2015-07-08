<a name="0.2.13"></a>
# 0.2.13 (2015-07-08)

## Bugfix
- Added lib directory to npm ignore

<a name="0.2.12"></a>
# 0.2.12 (2015-07-07)

## Features
- Added support for fetching sonar-runner when it is not available on the path

<a name="0.2.9"></a>
# 0.2.9 (2015-06-30)

## Features
- Added support for adding integration tests coverage

<a name="0.2.7"></a>
# 0.2.7 (2015-06-15)

## Bug Fixes
- Added support excluding any sonar property.

<a name="0.2.6"></a>
# 0.2.6 (2015-06-09)

## Bug Fixes
- Added support for not adding a parameter to sonar by providing null as a value.

<a name="0.2.4"></a>
# 0.2.4 (2015-04-10)

## Bug Fixes
- Fixed Karma sonar should not write options instance when they are undefined.

<a name="0.2.3"></a>
# 0.2.3 (2015-04-07)

## Bug Fixes
- Fixed Specs that escape characters are matched incorrectly, resulting in exclusion
- Fixed Multiple test files that have specs with the same name are resolved incorrectly
- Fixed Files with test directory different then `test` don't get copied
- Fixed Files with source directory different then `src` don't get copied

<a name="0.2.2"></a>
# 0.2.2 (2015-04-02)

## Bug Fixes
- Fixed regex for finding tests with double and single quotes
- Fixed regex for finding testcases that have an autoclose tag
- Added check for files that are in the test directory but are no tests

<a name="0.2.1"></a>
# 0.2.1 (2015-04-02)

## Bug Fixes
- #17 Cannot find module 'fs-extra'

<a name="0.2.0"></a>
# 0.2.0 (2015-04-02)

## Breaking changes
- The configuration has changed.

## Features
- Added support for dry-run
- Added support for adding custom sonar properties

## Bug Fixes
- 'karma_sonar' task now stops when an error has occurred
- karma-junit-reporter reports are now processed and updated with the correct spec for classname