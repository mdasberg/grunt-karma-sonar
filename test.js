var args = [ '-Dsonar.sources=src',
    '-Dsonar.tests=test',
    '-Dsonar.javascript.jstestdriver.reportsPath=results',
    '-Dsonar.javascript.lcov.reportPath=results/coverage_report.lcov',
    '-Dsonar.jdbc.url=jdbc:h2:tcp://localhost:9092/sonar',
    '-Dsonar.sourceEncoding=UTF-8',
    '-Dsonar.language=js',
    '-Dsonar.dynamicAnalysis=reuseReports',
    '-Dsonar.projectBaseDir=.tmp/sonar2',
    '-Dsonar.scm.disabled=true',
    '-Dsonar.projectKey=grunt-karma-sonar',
    '-Dsonar.projectName=Grunt-karma-sonar plugin',
    '-Dsonar.projectVersion=0.2.0',
    '-Dsonar.links.homepage=https://github.com/mdasberg/grunt-karma-sonar',
    '-Dsonar.branch=master' ];

var excludedProperties = ['sonar.properties'];

a


function isExcluded(key) {
    return excludedProperties.indexOf(key) > -1;
    

}