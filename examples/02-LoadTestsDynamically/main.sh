#!/usr/bin/env bash.origin.script

depend {
    "server": "@com.github/bash-origin/bash.origin.express#s1"
}

# TODO: Instead of ignoring lines, do not log info that changes (time, user agent)
echo ">>>TEST_IGNORE_LINE:^127\.<<<"

BO_cecho "TODO: Request page in browser and close browser." RED

CALL_server run {
    "routes": {
        "/tests.js": {
            "@it.pinf.org.browserify#s1": {
                "src": "$__DIRNAME__/tests.js",
                "format": "pinf"
            }
        },
        "^/": {
            "@it.pinf.org.mochajs#s1": {
                # TODO: Make specifying the 'basedir' optional as it can be automatically derived.
                "basedir": "$__DIRNAME__",
                "exit": true,
                "tests": {
                    "01-HelloWorld": function /* CodeBlock */ () {

                        const PINF = require("pinf-loader-js");

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

echo "OK"
