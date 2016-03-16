<a name="0.2.23"></a>
# 0.2.23 (2016-03-16)

## Bugfix
- Fix Scenario outlines are not resolved to a feature file

<a name="0.2.22"></a>
# 0.2.22 (2016-03-02)

## Improvements
- Upgrade dependency for grunt 1.0.0
- Upgrade all other dependencies
- Add all sources for language (web)

<a name="0.2.21"></a>
# 0.2.21 (2016-02-04)

## Bugfix
- Fix sonar properties with null values are not added anymore

<a name="0.2.20"></a>
# 0.2.20 (2016-02-02)

## Bugfix
- Fix install exits when sonar-runner-dist is not found on the cdnurl

<a name="0.2.19"></a>
# 0.2.19 (2016-01-27)

## Improvements
- Add check for sonar-runner in the lib dir and update log message to be more clear
- Update all dependencies

<a name="0.2.18"></a>
# 0.2.18 (2016-01-09)

## Feature
- Add cucumber testframework support
- Add debug option

## Bugfix
- Fix sonar-runner cmd for windows
- Update documentation to reflect task name change from 'karma_sonar' to 'karmaSonar'
- Modified the regex to be non-greedy (src: js/x/some.js) 

<a name="0.2.17"></a>
# 0.2.17 (2015-09-18)

## Bugfix
- Fix conditional specs aren't being resolved and result in an error 

<a name="0.2.16"></a>
# 0.2.16 (2015-09-15)

## Bugfix
- Fix file merge fails if there is disabled jasmine test ('xit()')
- Fix tests that contain '' in jasmine it break sonar

<a name="0.2.15"></a>
# 0.2.15 (2015-09-11)

## Features
- Added support for adding integration tests results

<a name="0.2.14"></a>
# 0.2.14 (2015-09-09)

## Bugfix
- Fix support for karma-junit-reporter higher then 0.3.1 (glob support)
- Fix test files containing dots in the name do not get uploaded 

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