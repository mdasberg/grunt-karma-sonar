# grunt-karma-sonar

> Grunt plugin for integrating karma reports with sonar

## Getting Started
This plugin requires Grunt `~0.4.1`

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

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  karma_sonar: {
    options: {},
    your_target: {
      project: {
        key: 'grunt-sonar',
        name: 'Grunt sonar plugin',
        version: '0.1.1'
      },
      sources: [
        {
          path: '...',
          prefix: '...', // karma path in lcov files is incorrect, you can use prefix to fix this.
          coverageReport: '.../path/to/lcov.info',
          testReport: '.../path/to/junit.xml'
        },
        {
          path: '...',
          prefix: '...', // karma path in lcov files is incorrect, you can use prefix to fix this.
          coverageReport: '.../path/to/lcov.info',
          testReport: '.../path/to/junit.xml'
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
  karma_sonar: {
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
        version: '0.1.1'
      },
      options: {
        runnerProperties: {
          'sonar.links.homepage': 'https://github.com/mdasberg/grunt-karma-sonar',
          'sonar.branch': 'master'
        }
      },
      sources: [...],
      exclusions: []
    }
  }
})
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
