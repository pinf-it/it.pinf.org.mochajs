#!/usr/bin/env bash.origin.script

[ ! -e ".~" ] || rm -Rf .~*

depend {
    "runner": "gi0.PINF.it/core # runner/v0"
}

# TODO: Instead of ignoring lines, do not log info that changes (time, user agent)
echo ">>>TEST_IGNORE_LINE:^127\.<<<"
echo ">>>TEST_IGNORE_LINE:Waiting until program <<<"

CALL_runner run {
    "#": {
        "server": "bash.origin.express",
        "runner": "it.pinf.dev.pptr"
    },
    ":server:": "server @ server/v0",
    ":runner:": "runner @ runner/v0",

    "gi0.PINF.it/core/v0 @ # :server: set() config": {
        "port": 3000,
        "routes": {
            "/tests.js": {
                "gi0.PINF.it/build/v0 # /.dist # /tests-bundle.js": {
                    "@it.pinf.org.browserify # router/v1": {
                        "src": "$__DIRNAME__/tests.js",
                        "format": "pinf"
                    }
                }
            },
            "^/": {
                "gi0.PINF.it/build/v0 # /.dist # /": {
                    "@it.pinf.org.mochajs # router/v1": {
                        "exit": true,
                        "tests": {
                            "01-HelloWorld": function /* CodeBlock */ () {

                                const PINF = require("pinf-loader-js/loader.browser.js").PINF;

                                describe('Load', function () {
                                    it('Tests', function (done) {

                                        PINF.sandbox("/tests.js", function (sandbox) {
                                            sandbox.main();
                                            done();
                                        }, done);
                                    });
                                });
                            }
                        }
                    }
                }
            }
        }
    },
    "gi0.PINF.it/core/v0 @ # :server: run() start": "",

    "gi0.PINF.it/core/v0 @ # :runner: run() start": "http://localhost:3000/index.html",

    "gi0.PINF.it/core/v0 @ # :server: run() waitForStop": "",

    "gi0.PINF.it/core/v0 @ # :runner: run() stop": ""
}

echo "OK"

