var sync = require('child_process').execSync,
    glob = require('glob'),
    fs = require('fs'),
    path = require('path');

isSonarInstalled();

function isSonarInstalled() {
    return isSonarInstalledGlobally() || isSonarInstalledLocally();
}

function isSonarInstalledGlobally() {
    try {
        sync('sonar-runner --version', {encoding: 'utf8', stdio: ['ignore', 'ignore', 'ignore']});
        console.debug('Sonar-runner is already installed globally.');
        exit(0);
    } catch (e) {
        console.log('command not found: sonar-runner (is not available globally)');
        return false;
    }
}

function isSonarInstalledLocally() {
    var libDir = path.join(__dirname, 'lib'),
        extension = (/^win/.test(process.platform) ? '.bat' : '');
    console.log(libDir)
    if (fs.existsSync(libDir)) {
        glob.sync('**/bin/sonar-runner' + extension, {cwd: libDir, root: '/'}).forEach(function (file) {
            console.log('Sonar-runner is already installed locally.');
            exit(0);
        });
    }
    console.log('command not found: sonar-runner (is not available locally)');
    return false;
}
