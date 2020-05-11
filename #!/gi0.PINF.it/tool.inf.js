
// TODO: For now we can only run one mocha instance at a time where we expect
//       all APIs to work. If we have more than one instance, reports and other
//       references will get crossed. Need to refactor to allow multiple instances to
//       run where APIs are linked via an instance ID or alias that is automatically
//       generated based on declaration context or defined by the user.
//       So for now only the first instance supports cross-API calls.


let runHomeInstructions = null;
const reports = {};
let allSuitesDoneDeferred = null;

exports['gi0.PINF.it/build/v0'] = async function (LIB, CLASSES) {

    if (!allSuitesDoneDeferred) {
        allSuitesDoneDeferred = LIB.Promise.defer();
    }

    allSuitesDoneDeferred.promise.then(function () {

        LIB.console.log(`All suites '${Object.keys(reports).join(',')}' reported in.`);

        process.stdout.write('>>>TEST_IGNORE_LINE:"(start|end|duration)": (".*Z"|[\\d]+),?\s*$<<<\n');
        // TODO: Identify result using URI
        process.stdout.write("<RESULTS>\n");
        process.stdout.write(JSON.stringify(LIB.LODASH(reports).toPairs().sortBy(0).fromPairs().value(), null, 4) + "\n");
        process.stdout.write("</RESULTS>\n");
    });

    let resultAPI = null;

    class BuildStep extends CLASSES.BuildStep {

        async onEveryBuild (result, build, target, instance, home, workspace) {

//console.error("MOCHA BUILD:", result, build, target, instance, home, workspace, new Error().stack);

            if (instance.api === 'expect/v1') {

                if (build.config.wait) {

                    if (!build.config.suites) {
                        throw new Error(`No 'suites' to wait for specified!`);
                    }

                    LIB.console.info(`Wait for all test suites '${Object.keys(build.config.suites).join(',')}' to finish.`);

                    await allSuitesDoneDeferred.promise;
                }

                return;
            }

            if (resultAPI === null) {

                if (build.config.suites) {
                    build.config.suites.forEach(function (suite) {
                        if (typeof reports[suite] !== 'undefined') {
                            throw new Error(`Suite '${suite}' was declared more than once!`);
                        }
                        reports[suite] = null;
                    });
                }

                if (
                    build.config.tests &&
                    !result.complete
                ) {

                    await runHomeInstructions();

                    build.config.indexFilename = build.config.indexFilename || 'index';

                    var tests = [];
                    Object.keys(build.config.tests).map(function (testName) {
                        var test = LIB.CODEBLOCK.compile(build.config.tests[testName], {
                            build: build
                        });
                        tests.push([
                            'describe("' + testName + '", function () {',
                                test.getCode(),
                            '})'
                        ].join("\n"));
                    });

                    async function generateJSIndex () {

                        if (
                            build.config.indexFormat &&
                            build.config.indexFormat !== 'js'
                        ) {
                            return;
                        }

                        var code = await LIB.FS.readFile(LIB.PATH.join(__dirname, "../../www/index.js"), "utf8");

                        code = code.replace(/%%LIB_BASE_URL%%/g, "/.lib");
                        code = code.replace(/%%TESTS%%/g, tests.join("\n"));
                        
    //console.log("workspace.path, home.path", workspace, "--", home)

                        code = code.replace(/%%STOP_URL%%/g, `${build.config.apiBaseUrl || `./${LIB.PATH.relative(workspace.path, home.path)}`}/stop`);
                        code = code.replace(/%%SUITE%%/g, build.config.suite || "");

                        // var hash = LIB.CRYPTO.createHash("sha1").update(code).digest('hex').substring(0, 7);
                        // TODO: Instead of using 'hash' here use an identifier that refers to the file + codeblock or other ID
                        //       so we can always target the same file and allow browserify to dynamically re-bundle on source changes.
                        // var path = LIB.PATH.join(__dirname, ".~rt/it.pinf.org.mochajs", workspace.path.replace(/\//g, "~"), "index-" + hash + ".js");
                        // await LIB.FS.outputFile(path, code, "utf8");

                        const targetJSPath = LIB.PATH.join(target.path, `${build.config.indexFilename}.js`);
                        result.outputPaths[targetJSPath] = true;
                        await LIB['@pinf-it/core']({
                            cwd: workspace.path
                        }).runToolForModel(
                            'gi0.PINF.it/build/v0',
                            `/${LIB.PATH.relative(workspace.path, target.path)}`.replace(/\/\//g, '/'),
                            `/${build.config.indexFilename}.js`,
                            'it.pinf.org.browserify # build/v1', {
                                "paths": LIB.PATH.join(__dirname, "../../node_modules"),
                                "code": code,
                                "format": "pinf",
                                "babel": build.config.babel
                            }
                        );

                        // const codePath = await LIB['@pinf-it/core']({
                        //     cwd: options.invocation.pwd,
                        //     mountPrefix: '/' + LIB.PATH.relative(options.invocation.pwd, build.config.dist)
                        // }).runTool('it.pinf.org.browserify # build/v0', {
                        //     "basedir": build.config.basedir,
                        //     "src": path,
                        //     "format": "pinf",
                        //     babel: build.config.babel
                        // });
                    }

                    async function generateHTMLIndex () {

                        if (
                            build.config.indexFormat &&
                            build.config.indexFormat !== 'html'
                        ) {
                            return;
                        }

                        const targetHTMLPath = LIB.PATH.join(target.path, `${build.config.indexFilename}.html`);

                        const testsJSPath = LIB.PATH.join(target.path, 'tests.js');
                        result.outputPaths[testsJSPath] = true;
                        await LIB['@pinf-it/core']({
                            cwd: workspace.path
                        }).runToolForModel(
                            'gi0.PINF.it/build/v0',
                            `/${LIB.PATH.relative(workspace.path, target.path)}`.replace(/\/\//g, '/'),
                            `/tests.js`,
                            'it.pinf.org.browserify # build/v1', {
                                "code": tests.join("\n")
                            }
                        );
                        const jsCode = await LIB.FS.readFile(testsJSPath, 'utf8');

                        result.inputPaths[LIB.PATH.join(__dirname, "../../www/index.html")] = true;
                        var page = await LIB.FS.readFile(LIB.PATH.join(__dirname, "../../www/index.html"), "utf8");

                        page = page.replace(/%%LIB_BASE_URL%%/g, "/.lib");
                        page = page.replace(/%%TESTS%%/g, jsCode);
                        page = page.replace(/%%STOP_URL%%/g, `${build.config.apiBaseUrl || `.`}/stop`);
                        page = page.replace(/%%SUITE%%/g, build.config.suite || "");

                        result.outputPaths[targetHTMLPath] = true;
                        await LIB.FS.outputFile(targetHTMLPath, page, "utf8");
                    }

                    await generateJSIndex();
                    await generateHTMLIndex();
                }

                resultAPI = {};
                resultAPI.router = function (API) {
        
                    async function reportSuccess (suite, report) {

                        if (reports[suite]) {
                            // Ignore duplicate reports.
                            return;
                        }

                        LIB.console.log("Report success for suite:", suite);
                        LIB.console.debug("Configured suites:", build.config.suites);

                        reports[suite] = report;

                        if (Object.keys(reports).filter(function (suite) {
                            return !reports[suite];
                        }).length > 0) {
                            // There are pending reports.
                            LIB.console.debug(`There are still outstanding suites:`, reports);
                            return;
                        }
                    
                        LIB.console.debug(`All suites have completed:`, reports);
                    
                        await allSuitesDoneDeferred.resolve(reports);
                    
                        await exitIfDesired();
                    }
                    
                    async function exitIfDesired () {

                        LIB.console.debug("exitIfDesired() build.config.exit", build.config.exit);

                        if (build.config.exit !== true) {
                            return;
                        }

                        LIB.console.log("All test suites completed.");
                        
                        if (process.env.BO_TEST_FLAG_DEV) {
                            LIB.console.info("NOTE: Leaving browser open due to '--dev'.");
                            return;
                        }

                        if (API && API.SERVER) {

                            LIB.console.log("Calling 'SERVER.stop()'.");

                            API.SERVER.stop();

                        } else {
                            throw new Error(`No API.SERVER.stop() found!`);
                        }
                    }

                    const staticServer = API.SERVER.middleware.static(target.path);

                    return async function (req, res, next) {

                        LIB.console.debug(`Received request:`, req.method, req.url);

                        if (req.url === '/stop') {

                            LIB.console.log(`Received stop for suite '${req.body.suite || ''}'.`);
                            LIB.console.debug(`Received stop for suite '${req.body.suite || ''}':`, req.body);

                            if (req.body.error) {
                                                    
                                process.stdout.write("<RESULT" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + " passed=\"false\">\n");
                                process.stdout.write(req.body.error + "\n");
                                process.stdout.write("</RESULT>\n");

                                if (process.env.BO_TEST_FLAG_DEV) {
                                    LIB.console.info("NOTE: Leaving browser open due to '--dev'.");
                                } else {
                                    process.exit(1);
                                }

                            } else
                            if (req.body.failure) {

                                process.stdout.write("<FAILURE" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + ">\n");
                                process.stdout.write(JSON.stringify(req.body.failure, null, 4) + "\n");
                                process.stdout.write("</FAILURE>\n");

                                if (process.env.BO_TEST_FLAG_DEV) {
                                    LIB.console.info("NOTE: Leaving browser open due to '--dev'.");
                                } else {
                                    process.exit(1);
                                }

                            } else
                            if (req.body.stats) {

                                // if (!reportSuccess) {
                                    process.stdout.write('>>>TEST_IGNORE_LINE:"(start|end|duration)": (".*Z"|[\\d]+),?\s*$<<<\n');
                                    // TODO: Identify result using URI
                                    process.stdout.write("<RESULT" + ((req.body.suite) ? ' suite="' + req.body.suite + '"' : "") + " passed=\"true\">\n");
                                    process.stdout.write(JSON.stringify(req.body, null, 4) + "\n");
                                    process.stdout.write("</RESULT>\n");
                                // }
                                
                                if (req.body.stats.failures === 0) {

                                    // Test success
                                    if (req.body.suite) {
                                        await reportSuccess(req.body.suite, req.body.stats);
                                    } else {
                                        await exitIfDesired();
                                    }

                                } else {
                                    LIB.console.error("[it.pinf.org.mochajs] ERROR: Test failures!");
                                }
                            } else {
                                var err = new Error("Request not understood");
                                LIB.console.error(err);
                                next(err);
                                return;
                            }

                            res.writeHead(200, {
                                "Content-Type": "application/json"
                            });
                            res.end("{}");
                            return;
                        }

                        staticServer(req, res, next);
                    }
                };
            }

            return resultAPI;
        }
    }

    return BuildStep;    
}


exports.inf = async function (INF, NS) {
    return {
        invoke: async function (pointer, value, options) {
            if (pointer === 'onHome()') {
                runHomeInstructions = async function () {
                    return INF.load(value);
                }
                return true;
            }
        }
    };
}
