# grunt-karma-sonar [![Build Status](https://travis-ci.org/mdasberg/grunt-karma-sonar.svg?branch=master)](https://travis-ci.org/mdasberg/grunt-karma-sonar)

> Grunt plugin for integrating karma reports with sonar

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-karma-sonar --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-karma-sonar');
```

## The "karma_sonar" task

### Overview
In your project's Gruntfile, add a section named `karma_sonar` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  karma_sonar: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.dynamicAnalysis
Type: `String`
Default: 'reuseReports'

Should be the sonar.property dynamicAnalysis

#### options.sourceEncoding
Type: `String`
Default: 'UTF-8'

Should be the sonar.property sourceEncoding

#### options.language
Type: `String`
Default: 'js'

Should be the sonar.property language (Starting with SonarQube 4.2, multi-language projects are supported. To enable this, set the value to null)

#### options.scmDisabled
Type: `String`
Default: 'true'

Should be the sonar.property scmDisabled

#### options.defaultOutputDir
Type: `String`
Default: '.tmp/sonar/'

Should be the location where the karmaSonar plugin will put it's temporary files.

#### options.excludedProperties
Type: `Array`
Default: []

Should be a list of sonar properties to exclude

#### options.instance.hostUrl
Type: `String`
Default: 'http://localhost:9000'

Should be the sonar.property host.url

#### options.instance.jdbcUrl
Type: `String`
Default: 'jdbc:h2:tcp://localhost:9092/sonar'

Should be the sonar.property jdbc.url

#### options.instance.jdbcUsername
Type: `String`
Default: 'sonar'

Should be the sonar.property jdbc.username

#### options.instance.jdbcPassword
Type: `String`
Default: 'sonar'

Should be the sonar.property jdbc.password

#### options.instance.login
Type: `String`
Default: 'admin'

Should be the sonar.property login

#### options.instance.password
Type: `String`
Default: 'admin'

Should be the sonar.property password

#### options.instance.runnerProperties
Type: `Object`

Should be the list of key(`sonar key`) value pairs.

```js
runnerProperties: {
    'sonar.links.homepage': 'https://github.com/mdasberg/grunt-karma-sonar',
    'sonar.branch': 'master'
}
```

#### project
Type: `Object`,
Mandatory: true

Should be the project information for sonar

#### project.key
Type: `String`
Mandatory: true`

Should be the project key for sonar 

#### project.name
Type: `String`
Mandatory: true`

Should be the project name for sonar
 
#### project.version
Type: `String`
 
Should be the project version for sonar 

#### paths
Type: `Array`
 
Should be the paths that contain the code, tests and results

#### paths[].cwd
Type: `String`
Default: '.'
 
Should be the current working directory that contain the source, tests and results folders are located

#### paths[].src
Type: `String`
 
Should be the directory containing the sources within the cwd.

#### paths[].test
Type: `String`
 
Should be the directory containing the tests within the cwd.

#### paths[].reports
Type: `Object`
 
Should be the object containing the reports.

#### paths[].reports.unit
Type: `String`
 
Should be the location of the karma-junit-reporter report within the cwd.

#### paths[].reports.coverage
Type: `String`
 
Should be the glob for the lcov.info files within the cwd.

#### paths[].reports.itCoverage
Type: `String`
 
Should be the glob for the integration test lcov.info files within the cwd.

### Usage Examples

#### Default Options

```js
grunt.initConfig({
  karmaSonar: {
    options: {
    
    },
    your_target: {
      project: {
        key: 'grunt-sonar',
        name: 'Grunt sonar plugin',
        version: '0.1.1'
      },
      paths: [
        {
          cwd: '...', // the current working directory'
          src: '...', // the source directory within the cwd
          test: '...', // the test directory within the cwd
          reports: {
              unit: '../path/result.xml', // the result file within the cwd
              coverage: '../path/**/lcov.info', // the glob for lcov files'
              itCoverage: '../path/**/lcov.info' // the glob for integration lcov files'
          }
        },
        {
          cwd: '...', // the current working directory'
          src: '...', // the source directory within the cwd
          test: '...', // the test directory within the cwd
          reports: {
              unit: '../path/result.xml', // the result file within the cwd
              coverage: '../path/**/lcov.info', // the glob for lcov files'
              itCoverage: '../path/**/lcov.info' // the glob for integration lcov files'
          }
      ],
      exclusions: []
    }
  }
})
```

#### Custom Options
In this example, custom options are used to do something else with whatever else. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result in this case would be `Testing: 1 2 3 !!!`

```js
grunt.initConfig({
  karmaSonar: {
    options: {
      defaultOutputDir: '.tmp/sonar/custom_options/',
      instance: {
        hostUrl : 'http://localhost:20001',
        jdbcUrl : 'jdbc:h2:tcp://localhost:20003/sonar',
        login: 'admin',
        password: 'admin'
      }
    },
    your_target: {
      project: {
        key: 'grunt-sonar',
        name: 'Grunt sonar plugin',
        version: '0.2.8'
      },
      paths: [...],
      exclusions: []
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

