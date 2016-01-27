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
        cdnDir = process.env.npm_config_sonarrunner_cdndir || process.env.SONARRUNNER_CDNDIR,
        destination = 'lib',
        validExit = false;

    /** Handle event handling when an exit occurs. */
    process.on('exit', function () {
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
        return isSonarInstalledGlobally() || isSonarInstalledLocally();
    }

    /**
     * Indicates if sonar-runner is available globally (ie on the command-line)
     * @return <code>true</code> if available, else <code>false</code>.
     */
    function isSonarInstalledGlobally() {
        try {
            sync('sonar-runner --version', {encoding: 'utf8', stdio: ['ignore', 'ignore', 'ignore']});
            console.log('Sonar-runner is already installed on the path`.');
            exit(0);
        } catch (e) {
            console.log('Sonar-runner command [sonar-runner] could not be found on the path, checking locally...');
            return false;
        }
    }

    /**
     * Indicates if sonar-runner is available locally (in the lib dir)
     * @return <code>true</code> if available, else <code>false</code>.
     */
    function isSonarInstalledLocally() {
        var libDir = path.join(__dirname, 'lib'),
            extension = (/^win/.test(process.platform) ? '.bat' : '');

        if (fs.existsSync(libDir)) {
            glob.sync('**/bin/sonar-runner' + extension, {cwd: libDir, root: '/'}).forEach(function (file) {
                console.log('Sonar-runner is already installed locally.');
                exit(0);
            });
        }
        console.log('Sonar-runner command [sonar-runner] could not be found locally either.');
        return false;
    }

    /**
     * Copy the latest sonar-runner from the given cdn dir.
     * @param cdnDir The cdn dir.
     * @return destination The location where the latest sonar-runner is copied to.
     * @throws error If no sonar-runner can be found on the cdn.
     */
    function copyLatestVersion(cdnDir) {
        var latestAvailableVersion, latestFileName;
        glob.sync('sonar-runner*.zip', {cwd: cdnDir, root: '/'}).forEach(function (file) {
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
            src = cdnDir + path.sep + latestFileName;
        });

        if (latestFileName !== undefined) {
            var source = cdnDir + path.sep + latestFileName,
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
     * Fetch the cdn release of sonar-runner from nexus.
     * @param cdnDir The cdn url. 
     * @return destination The location where the cdn sonar-runner is copied to.
     */
    function fetchCdnVersion(cdnUrl) {
        var response = request('GET', cdnUrl + path.sep + 'sonar-runner-dist.zip');
        var destination = path.join('.tmp', 'sonar-runner-dist.zip');
        fs.mkdirsSync('.tmp', '0775');
        fs.writeFileSync(destination, response.getBody(), {replace: true});
        return destination;
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
            pkg = fetchCdnVersion(cdnUrl);
            console.log('Fetching sonar-runner from CDN url [' + cdnUrl + '.');
        } else if(cdnDir) {
            // 3. fetch cdn version
            pkg = copyLatestVersion(cdnDir);
            console.log('Fetching sonar-runner from CDN dir [' + cdnDir + '.');
        } else {
            console.log('No CDN url or directory have been specified.');
            console.log('Usage: either specify property sonarrunner_cdnurl/sonarrunner_cdndir  in .npmrc or define it as a environment variable as SONARRUNNER_CDNURL/SONARRUNNER_CDNDIR.')
        }

        if (!pkg) { // 4. if no version is copied or something went wrong, try to fetch it from remote.
            try {
                console.log('Using remote location to fetch sonar-runner.');
                pkg = fetchLatestVersion();
            } catch (e) {
                console.error('Could not download the latest version of sonar-runner from the remote repository due to the following error [' + e + '].');
                exit(1);
            }
        }
        // 5. make it available by extracting it.
        extractLatestVersion(pkg);
    }

    exit(0);


})();
