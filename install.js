(function () {
    var path = require('path'),
        fs = require('fs-extra'),
        glob = require('glob'),
        semver = require('semver'),
        request = require('sync-request'),
        AdmZip = require('adm-zip'),
        sync = require('child_process').execSync,
        kew = require('kew');

    var cdnUrl = process.env.npm_config_sonarrunner_cdnurl || process.env.SONARRUNNER_CDNURL,
        destination = 'lib',
        validExit = false;

    /** Handle event handling when an exit occurs. */
    process.on('exit', function () {
        console.log('exit');
        if (!validExit) {
            console.log('Install exited unexpectedly');
            exit(1)
        }
    });

    /**
     * Handles a valid exit. 
     * @param code The exit code.
     */
    function exit(code) {
        validExit = true;
        process.exit(code || 0)
    }
   
    /**
     * Indicates if sonar-runner is available.
     * @return <code>true</code> if available, else <code>false</code>.
     */
    function isSonarInstalled() {
        try {
            sync('sonar-runner --version');
            console.log('Sonar-runner is already installed.');
            exit(0);
        } catch (e) {
            return false;
        }
    }

    /**
     * Copy the latest sonar-runner from the given cdn url.
     * @param cdnUrl The cdn url.
     * @return destination The location where the latest sonar-runner is copied to.
     * @throws error If no sonar-runner can be found on the cdn.
     */
    function copyLatestVersion(cdnUrl) {
        var latestAvailableVersion, latestFileName;
        glob.sync('sonar-runner*.zip', {cwd: cdnUrl, root: '/'}).forEach(function (file) {
            var match = /sonar-runner.*(\d)\.(\d)\.?(\d?).zip/.exec(file);
            if (match) { // convert to semver
                var currentVersion = (match[1] + '.' + match[2] + '.' + (match[3] ? match[3] : '0'));
                if (latestAvailableVersion === undefined) {
                    latestAvailableVersion = currentVersion;
                    latestFileName = file;
                } else if (semver.gt(currentVersion, latestAvailableVersion)) {
                    latestAvailableVersion = currentVersion;
                    latestFileName = file;
                }
            }
            src = cdnUrl + path.sep + latestFileName;
        });

        if (latestFileName !== undefined) {
            var source = cdnUrl + path.sep + latestFileName,
                destination = path.join('.tmp', latestFileName);

            if (destination) {
                fs.copySync(source, destination, {replace: true});
                return destination
            }
        } else {
            console.error('Could not find any sonar-runner on the specified CDN.');
            return;
        }
    }

    /**
     * Fetch the latest release of sonar-runner from nexus.
     * @return destination The location where the latest sonar-runner is copied to.
     */
    function fetchLatestVersion() {
        var response = request('GET', 'https://repository.sonatype.org/service/local/artifact/maven/redirect?r=central-proxy&g=org.codehaus.sonar.runner&a=sonar-runner-dist&v=LATEST&p=zip');
        var destination = path.join('.tmp', 'sonar-runner-dist.latest.zip');
        fs.mkdirsSync('.tmp', '0775');
        fs.writeFileSync(destination, response.getBody(), {replace: true});
        return destination;
    }

    /** Extract the latest release of sonar-runner to the lib directory. */
    function extractLatestVersion(source) {
        var deferred = kew.defer();
        try {
            fs.mkdirsSync(destination, '0775');
            fs.chmodSync(destination, '0775');

            // unzip file
            var zip = new AdmZip(source);
            zip.extractAllTo(destination, true);

            // fix execution rights
            glob.sync('**/bin/sonar-runner*', {cwd: destination, root: '/'}).forEach(function (file) {
                fs.chmodSync(destination + path.sep + file, '0777');
            });

            deferred.resolve(destination)
        } catch (err) {
            console.error('Error extracting zip');
            exit(1);
        }
        return deferred.promise
    }

    // 1. check if a cdn url has been specified
    if (!isSonarInstalled()) {
        var pkg;
        if (cdnUrl) {
            // 2. copy latest version
            pkg = copyLatestVersion(cdnUrl);
        } else {
            console.log('No CDN has been specified.');
            console.log('Usage: either specify property sonarrunner_cdnurl in .npmrc or define it as a environment variable as SONARRUNNER_CDNURL.')
        }

        if (!pkg) { // 3. if no version is copied or something went wrong, try to fetch it from remote.
            try {
                console.log('Using remote location to fetch sonar-runner.');
                pkg = fetchLatestVersion();
            } catch (e) {
                console.error('Could not download the latest version of sonar-runner from the remote repository due to the following error [' + e + '].');
                exit(1);
            }
        }
        // 4. make it available by extracting it.
        extractLatestVersion(pkg);
    }

    exit(0);


})();
