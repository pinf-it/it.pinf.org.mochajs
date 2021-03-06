
const LIB = require("bash.origin.lib").forPackage(__dirname).js;


const Promise = LIB.BLUEBIRD;
Promise.defer = function () {
    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
}
const PATH = LIB.path;
const FS = LIB.FS_EXTRA;
const MIME_TYPES = LIB.MIME_TYPES;
const CODEBLOCK = LIB.CODEBLOCK;
const LODASH = LIB.LODASH;
const BO = LIB.BASH_ORIGIN;
const CRYPTO = LIB.crypto;


var reports = {};
var expectedReports = {};
var reportSuccess = null;
var allSuitesDoneDeferred = Promise.defer();

exports.forConfig = function (CONFIG) {

    function generateRoot (callback) {
        try {

            var tests = [];

            if (CONFIG.tests) {
                Object.keys(CONFIG.tests).map(function (testName) {
                    var test = CODEBLOCK.compile(CONFIG.tests[testName]);

                    tests.push([
                        'describe("' + testName + '", function () {',
                            test.getCode(),
                        '})'
                    ].join("\n"));
                });
            }

            if (!tests.length) {
                return callback(null, "");
            }

            if (CONFIG.rootFormat === "pinf") {

                var code = FS.readFileSync(PATH.join(__dirname, "www/index.js"), "utf8");

                code = code.replace(/%%LIB_BASE_URL%%/g, "/.lib");
                code = code.replace(/%%TESTS%%/g, tests.join("\n"));

                var apiBaseUrl = CONFIG.apiBaseUrl || "";

                code = code.replace(/%%STOP_URL%%/g, "http://127.0.0.1:" + CONFIG.variables.PORT + apiBaseUrl + "/stop");
                code = code.replace(/%%SUITE%%/g, CONFIG.suite || "");

                var hash = CRYPTO.createHash("sha1").update(code).digest('hex').substring(0, 7);
                // TODO: Instead of using 'hash' here use an identifier that refers to the file + codeblock or other ID
                //       so we can always target the same file and allow browserify to dynamically re-bundle on source changes.
                var path = PATH.join(__dirname, ".rt/it.pinf.org.mochajs", process.cwd().replace(/\//g, "~"), "index-" + hash + ".js");

                FS.outputFileSync(path, code, "utf8");

                return BO.invokeApi(
                    {
                        "@it.pinf.org.browserify#s1": {
                            "src": path,
                            "dist": CONFIG.dist,
                            "prime": true,
                            "format": "pinf",
                            babel: CONFIG.babel
                        }
                    },
                    "#io.pinf/process~s1",
                    [
                        {},
                        function (err, code) {
                            if (err) {
                                return callback(err);
                            }

                            // TODO: Remove on shutdown.
                            //FS.unlinkFileSync(path, code);

                            return callback(null, code);
                        }
                    ]
                );

            } else {

                return BO.invokeApi(
                    {
                        "@it.pinf.org.browserify#s1": {
                            "code": tests.join("\n"),
                            "basedir": CONFIG.basedir || process.cwd(),
                            babel: CONFIG.babel
                        }
                    },
                    "#io.pinf/process~s1",
                    [
                        {},
                        function (err, code) {
                            if (err) return callback(err);

                            var page = FS.readFileSync(PATH.join(__dirname, "www/index.html"), "utf8");

                            page = page.replace(/%%LIB_BASE_URL%%/g, "/.lib");
                            page = page.replace(/%%TESTS%%/g, code);
                            page = page.replace(/%%STOP_URL%%/g, "http://127.0.0.1:" + CONFIG.variables.PORT + "/stop");
                            page = page.replace(/%%SUITE%%/g, CONFIG.suite || "");
            
                            return callback(null, page);
                        }
                    ]
                );
            }

        } catch (err) {
            return callback(err);
        }
    }


    var deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });    

    if (
        CONFIG.prime &&
        CONFIG.dist
    ) {
        generateRoot(function (err, page) {
            if (err) {
                //console.error(err);
                deferred.reject(err);
                throw err;
            }
            FS.outputFileSync(CONFIG.dist, page, "utf8");
            return deferred.resolve(page);
        });
    } else {
        deferred.resolve(null);
    }


    function exitIfDesired (CONFIG, API) {
        if (CONFIG.exit !== true) {
            return;
        }

        if (process.env.BO_TEST_FLAG_DEV) {
            console.log("NOTE: Leaving browser open due to '--dev'.");
            return;
        }

        API.SERVER.stop(function (err) {
            if (err) {
                console.error(err);
                process.exit(1);
            }
            process.exit(0);
        });
    }

    var middleware = function (API) {
        
        return function (req, res, next) {

            if (process.env.VERBOSE) console.error("[it.pinf.org.mochajs] req:", req.method, req.url);

            if (
                req.method === "POST" &&
                req.url === "/stop"
            ) {

                if (process.env.VERBOSE) console.error("[it.pinf.org.mochajs] req.body:", req.body);

                if (req.body.error) {
                    
                    process.stdout.write("<RESULT" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + " passed=\"false\">\n");
                    process.stdout.write(req.body.error + "\n");
                    process.stdout.write("</RESULT>\n");

                    if (process.env.BO_TEST_FLAG_DEV) {
                        console.log("NOTE: Leaving browser open due to '--dev'.");
                    } else {
                        process.exit(1);
                    }

                } else
                if (req.body.failure) {

                    process.stdout.write("<FAILURE" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + ">\n");
                    process.stdout.write(JSON.stringify(req.body.failure, null, 4) + "\n");
                    process.stdout.write("</FAILURE>\n");

                    if (process.env.BO_TEST_FLAG_DEV) {
                        console.log("NOTE: Leaving browser open due to '--dev'.");
                    } else {
                        process.exit(1);
                    }

                } else
                if (req.body.stats) {

                    if (!reportSuccess) {
                        process.stdout.write('>>>TEST_IGNORE_LINE:"(start|end|duration)": (".*Z"|[\\d]+),?\s*$<<<\n');
                        // TODO: Identify result using URI
                        process.stdout.write("<RESULT" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + " passed=\"true\">\n");
                        process.stdout.write(JSON.stringify(req.body, null, 4) + "\n");
                        process.stdout.write("</RESULT>\n");
                    }
                    
                    if (req.body.stats.failures === 0) {

                        // Test success

                        if (req.body.suite) {
                            reportSuccess(req.body.suite, req.body.stats);
                        }

                        exitIfDesired(CONFIG, API);

                    } else {
                        console.error("[it.pinf.org.mochajs] ERROR: Test failures!");
                    }
                } else {
                    var err = new Error("Request not understood");
                    console.error(err);
                    return next(err);
                }

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                return res.end("{}");
            } else
            if (
                req.method === "GET" &&
                /^\/\.lib\//.test(req.url)
            ) {

                var path = PATH.join(__dirname, "node_modules", req.url.replace(/^\/\.lib\//, ""));

                res.writeHead(200, {
                    "Content-Type": MIME_TYPES.lookup(req.url)
                });

                res.end(FS.readFileSync(path, "utf8"));

                return null;
    /*                    
    console.log("package URL", req.url);

                    var path = PATH.join(__dirname, "node_modules", req.url.replace(/^\/\.lib\//, ""));

    console.log("package path", path);

                    return BO.invokeApi(
                        {
                            "@it.pinf.org.browserify#s1": {
                                "src": path,
                                "format": "standalone"
                            }
                        },
                        "#io.pinf/middleware~s1"
                    )(req, res, next);
    */
            }

            return generateRoot(function (err, page) {
                if (err) {
                    return next(err);
                }

                if (CONFIG.rootFormat === "pinf") {
                    res.writeHead(200, {
                        "Content-Type": "application/javascript"
                    });
                } else {
                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                }

                res.end(page);
                return null;
            });
        };
    };

    return {
        "#io.pinf/middleware~s2": function (API) {
            
            return deferred.promise.then(function (code) {

                return middleware(API);
            });
        },
        "#io.pinf/middleware~s1": function (API) {

            return middleware(API);
        },                    
        "#io.pinf/expect~s1": function (API) {

            if (CONFIG.suites) {
                expectedReports = CONFIG.suites;

                reportSuccess = function (suite, report) {

                    if (reports[suite]) {
                        // Ignore duplicate reports.
                        return;
                    }

                    reports[suite] = report;

                    if (expectedReports.filter(function (suite) {
                        return !reports[suite];
                    }).length > 0) {
                        // There are pending reports.
                        return;
                    }

                    process.stdout.write('>>>TEST_IGNORE_LINE:"(start|end|duration)": (".*Z"|[\\d]+),?\s*$<<<\n');
                    // TODO: Identify result using URI
                    process.stdout.write("<RESULTS>\n");
                    process.stdout.write(JSON.stringify(LODASH(reports).toPairs().sortBy(0).fromPairs().value(), null, 4) + "\n");
                    process.stdout.write("</RESULTS>\n");
                    
                    allSuitesDoneDeferred.resolve(reports);

                    exitIfDesired(CONFIG, API);
                }
            }

            return allSuitesDoneDeferred.promise;
        }
    }
}
