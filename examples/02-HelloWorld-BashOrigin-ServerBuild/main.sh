#!/usr/bin/env bash.origin.script

[ ! -e ".~" ] || rm -Rf .~*

depend {
    "runner": "gi0.PINF.it/core # runner/v0"
}

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
            "^/": {
                "gi0.PINF.it/build/v0 # /.dist # /": {
                    "@it.pinf.org.mochajs # router/v1": {
                        "exit": true,
                        "tests": {
                            "01-HelloWorld": function /* CodeBlock */ () {

                                describe('Array', function () {
                                    describe('#indexOf()', function () {

                                        it('should return -1 when the value is not present', function () {
                                            chai.assert.equal(-1, [1,2,3].indexOf(4));
                                        });
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
